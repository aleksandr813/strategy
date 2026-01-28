import Store from "../../services/store/Store";
import Server from "../../services/server/Server";
import Manager from "./Manager";
import Game from '../Game';
import Unit, { IAttackable } from '../entities/Unit';
import Building from '../entities/Building';
import EasyStar from 'easystarjs';
import { TPoint } from "../../config";
import GAMECONFIG from '../gameConfig';

const { MOVE_INTERVAL } = GAMECONFIG;

class Battle extends Manager {
    private store: Store;
    private server: Server;
    private easyStar: EasyStar.js;
    private combatIntervalId: NodeJS.Timeout | null = null;
    private updateBattleIntervalId: NodeJS.Timeout | null = null;
    private static readonly COMBAT_INTERVAL = 1000; 
    private static readonly UPDATE_BATTLE_INTERVAL = 200; 
    
    private damageToUnits: Map<number, number> = new Map();
    private damageToBuildings: Map<number, number> = new Map();
    private changedUnits: Set<number> = new Set();
    
    constructor(store: Store, server: Server, game: Game, easyStar: EasyStar.js) {
        super(game);
        this.store = store;
        this.server = server;
        this.easyStar = easyStar;
    }

    async loadBuildingsFromData(battleData: any): Promise<void> {
        const buildingTypes = await this.server.getBuildingTypes();
        if (!buildingTypes) return;

        const buildings = battleData.buildings.map((b: any) => {
            const typeData = buildingTypes.find(t => t.id === b.typeId);
            return new Building(
                Number(b.id),
                b.type,
                Number(b.currentHp),
                Number(b.currentHp),
                Number(b.level),
                b.size,
                Number(b.typeId),
                Number(b.x),
                Number(b.y),
                Number(b.unlockLevel),
                undefined,
                typeData
            );
        });
        this.game.setBuildings(buildings);
    }

    private updateUnitsState(newUnitsData: any[], side: 'ally' | 'enemy'): void {
        const currentUnits = this.game.getUnits();
        
        newUnitsData.forEach(u => {
            const id = Number(u.id);
            const existingUnit = currentUnits.find(unit => unit.id === id);

            if (existingUnit) {
                existingUnit.hp = Number(u.currentHp);
                existingUnit.coords.x = Number(u.x);
                existingUnit.coords.y = Number(u.y);
                existingUnit.level = Number(u.level);
                existingUnit.speed = Number(u.speed);
            } else {
                const newUnit = new Unit(
                    {
                        ...u,
                        id: id,
                        x: Number(u.x),
                        y: Number(u.y),
                        currentHp: Number(u.currentHp),
                        level: Number(u.level),
                        speed: Number(u.speed),
                    },
                    this.game,
                    this.easyStar,
                    side
                );
                
                if (newUnit.isMyUnit()) {
                    newUnit.onChanged = (unitId: number) => this.markUnitAsChanged(unitId);
                }
                currentUnits.push(newUnit);
            }
        });
    }

    async loadUnitsFromData(battleData: any): Promise<void> {
        const currentUnits = this.game.getUnits();
        const allNewUnitsData = [...battleData.alliedUnits, ...battleData.enemyUnits];
        const newIds = new Set(allNewUnitsData.map(u => Number(u.id)));

        const activeUnits = currentUnits.filter(u => newIds.has(u.id));
        this.game.setUnits(activeUnits);

        this.updateUnitsState(battleData.alliedUnits, 'ally');
        this.updateUnitsState(battleData.enemyUnits, 'enemy');
    }

    async loadBattle(): Promise<void> {
        const currentBattleId = this.game.getCurrentBattle();
        if (!currentBattleId) return;

        const response = await this.server.getBattle(currentBattleId);
        if (!response || !response.battleData) return;

        await this.loadBuildingsFromData(response.battleData);
        await this.loadUnitsFromData(response.battleData);
        
        this.initializePathfinding();
        
        if (!this.combatIntervalId) this.startCombatLoop();
        if (!this.updateBattleIntervalId) this.startUpdateBattleLoop();
    }
    
    private initializePathfinding(): void {
        const matrix = this.game.getMatrixForEasyStar(this.game.getUnits(), this.game.getBuildings());
        this.easyStar.setGrid(matrix);
        this.easyStar.setAcceptableTiles([0, 2]);
    }

    private attackTarget(units: Unit[], target: IAttackable): void {
        const allUnits = this.game.getUnits();
        const buildings = this.game.getBuildings();
        
        units.forEach(unit => {
            unit.setTarget(target);
            if (unit.isInAttackRange(target)) {
                return; 
            }
            
            const attackPos = unit.getAttackPosition(target);
            unit.calcPath(attackPos, allUnits, buildings);
        });

        if (!this.movementIntervalId) this.startMovementCycle();
    }

    public handleClick(x: number, y: number): void {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        const selectedUnits = this.game.getUnits().filter(u => u.isSelected && u.isMyUnit());
        if (selectedUnits.length === 0) return;

        const targetUnit = this.game.getUnits().find(u => u.isEnemy() && u.coords.x === gridX && u.coords.y === gridY);
        if (targetUnit) {
            this.attackTarget(selectedUnits, targetUnit);
            return;
        }
    }

        const targetBuilding = this.game.getBuildings().find(b => {
            const [bx, by] = [b.coords[0].x, b.coords[0].y];
            return gridX >= bx && gridX < bx + (b.size || 1) && gridY >= by && gridY < by + (b.size || 1);
        });
        if (targetBuilding) {
            this.attackTarget(selectedUnits, targetBuilding);
        }
    }

    public endBattle() {
        console.log("Бой закончен");
    }

    private async processCombat(): Promise<void> {
        const units = this.game.getUnits();
        const buildings = this.game.getBuildings();
        
        units.forEach(unit => {
            if (!unit.hasTarget() || !unit.isMyUnit()) return;

            const target = unit.getTarget();
            if (!target || target.hp <= 0) {
                unit.clearTarget();
                return;
            }

            if (unit.isInAttackRange(target)) {
                const isTargetBuilding = buildings.some(b => b.id === target.id);
                this.recordDamage(unit.id, target.id, isTargetBuilding);
                unit.attack(target);
            } else if (!unit.isMoving()) {
                const attackPos = unit.getAttackPosition(target);
                unit.calcPath(attackPos, units, buildings);
                if (!this.movementIntervalId) this.startMovementCycle();
            }
        });

        await this.cleanupDestroyedEntities();
    }

    private async cleanupDestroyedEntities(): Promise<void> {
        const buildings = this.game.getBuildings();
        const units = this.game.getUnits();

        const allyUnitsAlive = units.some(u => u.isMyUnit() && u.hp > 0);
    
        if (!allyUnitsAlive && units.length > 0) {
            this.endBattle();
        }

        const needsReload = units.some(u => u.hp <= 0) || buildings.some(b => b.hp <= 0);

        if (needsReload) {
            buildings.forEach(b => {
                if (b.hp <= 0 && (b.type === 'Castle' || b.typeId === 1)) {
                    this.endBattle();
                }
            });
            await this.loadBattle();
        }
    }

    private startCombatLoop(): void {
        if (this.combatIntervalId) clearInterval(this.combatIntervalId);
        this.combatIntervalId = setInterval(() => this.processCombat(), Battle.COMBAT_INTERVAL);
    }

    private startUpdateBattleLoop(): void {
        if (this.updateBattleIntervalId) clearInterval(this.updateBattleIntervalId);
        this.updateBattleIntervalId = setInterval(() => this.sendBattleUpdate(), Battle.UPDATE_BATTLE_INTERVAL);
    }

    private recordDamage(attackerId: number, targetId: number, isTargetBuilding: boolean): void {
        const storage = isTargetBuilding ? this.damageToBuildings : this.damageToUnits;
        storage.set(attackerId, targetId);
        this.changedUnits.add(attackerId);
    }

    private markUnitAsChanged(unitId: number): void {
        this.changedUnits.add(unitId);
    }

    private async sendBattleUpdate(): Promise<void> {
        const currentBattleId = this.game.getCurrentBattle();
        if (!currentBattleId || (this.changedUnits.size === 0 && this.damageToUnits.size === 0 && this.damageToBuildings.size === 0)) return;

        const changedMyUnits = this.game.getUnits().filter(u => u.isMyUnit() && this.changedUnits.has(u.id));
        const unitDamage: Record<number, number> = {};
        this.damageToUnits.forEach((v, k) => unitDamage[k] = v);
        const bldDamage: Record<number, number> = {};
        this.damageToBuildings.forEach((v, k) => bldDamage[k] = v);

        const result = await this.server.updateBattle(currentBattleId, changedMyUnits, unitDamage, bldDamage);
        if (result) {
            this.damageToUnits.clear();
            this.damageToBuildings.clear();
            this.changedUnits.clear();
        }
    }

    public destructor(): void {
        //if (this.combatIntervalId) clearInterval(this.combatIntervalId);
        //if (this.updateBattleIntervalId) clearInterval(this.updateBattleIntervalId);
        super.destructor();
    }
}

export default Battle;