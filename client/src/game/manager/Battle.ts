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

    async loadUnitsFromData(battleData: any): Promise<void> {
        const normalizeUnitData = (u: any) => ({
            ...u,
            x: Number(u.x),
            y: Number(u.y),
            currentHp: Number(u.currentHp),
            level: Number(u.level),
            speed: Number(u.speed),
            id: Number(u.id),
        });

        const createUnits = (units: any[], side: 'ally' | 'enemy') =>
            units.map(u => {
                const unit = new Unit(
                    normalizeUnitData(u),
                    this.game,
                    this.easyStar,
                    side
                );
                
                if (unit.isMyUnit()) {
                    unit.onChanged = (unitId: number) => {
                        this.markUnitAsChanged(unitId);
                    };
                }
                
                return unit;
            });

        const alliedUnits = createUnits(battleData.alliedUnits, 'ally');
        const enemyUnits  = createUnits(battleData.enemyUnits, 'enemy');

        this.game.setUnits([...enemyUnits, ...alliedUnits]);
    }

    async loadBattle(): Promise<void> {
        const currentBattleId = this.game.getCurrentBattle();
        if (!currentBattleId) return;

        this.game.setBuildings([]);
        this.game.setUnits([]);

        const response = await this.server.getBattle(currentBattleId);

        if (!response) {
            return;
        }

        const battleData = response.battleData;
        if (!battleData) return;

        await this.loadBuildingsFromData(battleData);
        await this.loadUnitsFromData(battleData);
        
        this.initializePathfinding();
        this.startCombatLoop();
        this.startUpdateBattleLoop();
    }
    
    private initializePathfinding(): void {
        const units = this.game.getUnits();
        const buildings = this.game.getBuildings();
        const matrix = this.game.getMatrixForEasyStar(units, buildings);
        
        this.easyStar.setGrid(matrix);
        this.easyStar.setAcceptableTiles([0, 2]);
    }

    moveUnits(destination: TPoint, units: Unit[], buildings: Building[], server: Server) {
        destination.x = Math.round(destination.x);
        destination.y = Math.round(destination.y);

        if (!this.isValidDestination(destination)) return;

        if (this.movementIntervalId) {
            clearInterval(this.movementIntervalId);
            this.movementIntervalId = null;
        }

        const selectedUnits: Unit[] = [];
        this.game.getUnits().forEach((unit) => {
            if (unit.isSelected && unit.isMyUnit()) {
                unit.calcPath(destination, units, buildings);
                selectedUnits.push(unit);
            }
        });

        if (selectedUnits.length > 0) {
            this.currentServer = server;
            this.startMovementCycle();
        }
    }

    protected startMovementCycle() {
        this.movementIntervalId = setInterval(() => {
            const movingUnits: Unit[] = [];
            let anyUnitMoving = false;

            this.game.getUnits().forEach((unit) => {
                if (unit.isMoving()) {
                    anyUnitMoving = true;
                    unit.movementAccumulator += unit.speed;
                    
                    if (unit.movementAccumulator >= 1) {
                        unit.movementAccumulator -= 1;
                        const oldX = unit.coords.x;
                        const oldY = unit.coords.y;
                        
                        unit.makeStep();
                        
                        if (oldX !== unit.coords.x || oldY !== unit.coords.y) {
                            movingUnits.push(unit);
                            if (unit.isMyUnit()) {
                                this.markUnitAsChanged(unit.id);
                            }
                        }
                    }
                }
            });
            
            if (movingUnits.length > 0 && this.currentServer) {
                this.currentServer.moveUnits(movingUnits);
            }

            if (!anyUnitMoving && this.movementIntervalId) {
                clearInterval(this.movementIntervalId);
                this.movementIntervalId = null;
            }
        }, MOVE_INTERVAL);
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

        const targetBuilding = this.game.getBuildings().find(b => {
            const [bx, by] = [b.coords[0].x, b.coords[0].y];
            return gridX >= bx && gridX < bx + (b.size || 1) && gridY >= by && gridY < by + (b.size || 1);
        });
        if (targetBuilding) {
            this.attackTarget(selectedUnits, targetBuilding);
        }
    }

    private attackTarget(units: Unit[], target: IAttackable): void {
        const allUnits = this.game.getUnits();
        const buildings = this.game.getBuildings();
        
        units.forEach(unit => {
            unit.setTarget(target);
            const attackPos = unit.getAttackPosition(target);
            unit.calcPath(attackPos, allUnits, buildings);
        });

        if (!this.movementIntervalId) {
            this.startMovementCycle();
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
        if (!currentBattleId) return;

        if (this.changedUnits.size === 0 && this.damageToUnits.size === 0 && this.damageToBuildings.size === 0) {
            return;
        }

        const units = this.game.getUnits();
        const changedMyUnits = units.filter(u => u.isMyUnit() && this.changedUnits.has(u.id));

        const unitDamage: Record<number, number> = {};
        this.damageToUnits.forEach((targetId, attackerId) => {
            unitDamage[attackerId] = targetId;
        });

        const buildingDamage: Record<number, number> = {};
        this.damageToBuildings.forEach((targetId, attackerId) => {
            buildingDamage[attackerId] = targetId;
        });

        const result = await this.server.updateBattle(
            currentBattleId,
            changedMyUnits,
            unitDamage,
            buildingDamage
        );

        if (result) {
            this.damageToUnits.clear();
            this.damageToBuildings.clear();
            this.changedUnits.clear();
        }
    }

    private processCombat(): void {
        const units = this.game.getUnits();
        
        units.forEach(unit => {
            if (!unit.hasTarget() || !unit.isMyUnit()) return;

            const target = unit.getTarget();
            if (!target || target.hp <= 0) {
                unit.clearTarget();
                return;
            }

            if (unit.isInAttackRange(target)) {
                const isTargetBuilding = this.game.getBuildings().some(b => b.id === target.id);
                this.recordDamage(unit.id, target.id, isTargetBuilding);
                unit.attack(target);
            } else if (!unit.isMoving()) {
                const attackPos = unit.getAttackPosition(target);
                unit.calcPath(attackPos, this.game.getUnits(), this.game.getBuildings());
                if (!this.movementIntervalId) this.startMovementCycle();
            }
        });

        this.cleanupDestroyedEntities();
    }

    private cleanupDestroyedEntities(): void {
        const units = this.game.getUnits();
        const aliveUnits = units.filter(u => u.hp > 0);
        if (aliveUnits.length !== units.length) this.game.setUnits(aliveUnits);

        const buildings = this.game.getBuildings();
        const aliveBuildings = buildings.filter(b => b.hp > 0);
        if (aliveBuildings.length !== buildings.length) this.game.setBuildings(aliveBuildings);
    }

    public destructor(): void {
        if (this.combatIntervalId) clearInterval(this.combatIntervalId);
        if (this.updateBattleIntervalId) clearInterval(this.updateBattleIntervalId);
        super.destructor();
    }
}

export default Battle;