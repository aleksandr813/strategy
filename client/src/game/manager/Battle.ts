import Store from "../../services/store/Store";
import Server from "../../services/server/Server";
import Manager from "./Manager";
import Game from '../Game';
import Unit, { IAttackable } from '../entities/Unit';
import Building from '../entities/Building';
import EasyStar from 'easystarjs';
import { TPoint } from "../../config";
import GAMECONFIG from '../gameConfig';

class Battle extends Manager {
    private store: Store;
    private server: Server;
    private easyStar: EasyStar.js;
    private combatIntervalId: NodeJS.Timeout | null = null;
    private static readonly COMBAT_INTERVAL = 1000; // Интервал атаки в мс
    
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
            units.map(u => new Unit(
                normalizeUnitData(u),
                this.game,
                this.easyStar,
                side
            ));

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
            console.log('getBattle вернул null');
            return;
        }

        const battleData = response.battleData;

        if (!battleData) {
            console.log('battleData отсутствует', response);
            return;
        }

        await this.loadBuildingsFromData(battleData);
        await this.loadUnitsFromData(battleData);
        
        this.initializePathfinding();
        this.startCombatLoop();

        const target = this.findNearestEnemyFromData(battleData);
    
        if (target) {
            console.log(`Ближайшая цель найдена в координатах: x:${target.x}, y:${target.y}`);
        }

    }
    
    private initializePathfinding(): void {
        const units = this.game.getUnits();
        const buildings = this.game.getBuildings();
        
        const matrix = this.game.getMatrixForEasyStar(units, buildings);
        
        this.easyStar.setGrid(matrix);
        
        this.easyStar.setAcceptableTiles([0, 2]);
        console.log('Pathfinding initialized with matrix:', matrix.length, 'x', matrix[0]?.length);
    }

    public findNearestEnemyFromData(battleData: any) {
        const { alliedUnits, enemyUnits, buildings } = battleData;

        if (!alliedUnits || alliedUnits.length === 0) return null;

        const primaryUnit = alliedUnits[0];
        const ux = Number(primaryUnit.x);
        const uy = Number(primaryUnit.y);

        const targets = [...(enemyUnits || []), ...(buildings || [])];

        if (targets.length === 0) return null;

        let nearestTarget = null;
        let minDistanceSq = Infinity;

        for (const target of targets) {
            const tx = Number(target.x);
            const ty = Number(target.y);

            const dx = ux - tx;
            const dy = uy - ty;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                nearestTarget = {
                    id: target.id,
                    x: tx,
                    y: ty,
                    type: target.typeId ? 'building' : 'unit'
                };
            }
        }

        return nearestTarget;
    }   

    moveUnits(destination: TPoint, units: Unit[], buildings: Building[], server: Server) {
        destination.x = Math.round(destination.x);
        destination.y = Math.round(destination.y);

        if (!this.isValidDestination(destination)) {
            return;
        }

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
            this.startMovementCycle();
        }
    }

    public handleClick(x: number, y: number): void {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);

        const selectedUnits = this.game.getUnits().filter(u => u.isSelected && u.isMyUnit());
        
        if (selectedUnits.length === 0) {
            return;
        }

        const targetUnit = this.findEnemyUnitAt(gridX, gridY);
        if (targetUnit) {
            this.attackTarget(selectedUnits, targetUnit);
            return;
        }

        const targetBuilding = this.findEnemyBuildingAt(gridX, gridY);
        if (targetBuilding) {
            this.attackTarget(selectedUnits, targetBuilding);
            return;
        }
    }

    private findEnemyUnitAt(x: number, y: number): Unit | null {
        return this.game.getUnits().find(u => 
            u.isEnemy() && 
            u.coords.x === x && 
            u.coords.y === y
        ) || null;
    }

    private findEnemyBuildingAt(x: number, y: number): Building | null {
        return this.game.getBuildings().find(b => {
            const [bx, by] = [b.coords[0].x, b.coords[0].y];
            if (b.size === 1) {
                return x === bx && y === by;
            }
            return x >= bx && x < bx + 2 && y >= by && y < by + 2;
        }) || null;
    }

    private attackTarget(units: Unit[], target: IAttackable): void {
        console.log(`Отдан приказ атаковать цель ${target.id}`);
        
        const allUnits = this.game.getUnits();
        const buildings = this.game.getBuildings();
        
        units.forEach(unit => {
            unit.setTarget(target);
            
            const attackPos = unit.getAttackPosition(target);
            
            unit.calcPath(attackPos, allUnits, buildings);
            console.log(`Юнит ${unit.id} движется к позиции атаки (${attackPos.x}, ${attackPos.y})`);
        });

        if (this.movementIntervalId) {
            clearInterval(this.movementIntervalId);
            this.movementIntervalId = null;
        }
        
        this.startMovementCycle();
    }

    private startCombatLoop(): void {
        if (this.combatIntervalId) {
            clearInterval(this.combatIntervalId);
        }

        this.combatIntervalId = setInterval(() => {
            this.processCombat();
        }, Battle.COMBAT_INTERVAL);
    }

    private processCombat(): void {
        const units = this.game.getUnits();
        
        units.forEach(unit => {
            if (!unit.hasTarget() || !unit.isMyUnit()) {
                return;
            }

            const target = unit.getTarget();
            if (!target) {
                return;
            }

            if (target.hp <= 0) {
                unit.clearTarget();
                console.log(`Юнит ${unit.id}: цель уничтожена`);
                return;
            }

            if (unit.isInAttackRange(target)) {
                if (unit.isMoving()) {
                    console.log(`Юнит ${unit.id} достиг цели и начинает атаку`);
                }
                unit.attack(target);
            } else if (!unit.isMoving()) {
                console.log(`Юнит ${unit.id} не в радиусе атаки, пересчет пути к цели ${target.id}`);
                const attackPos = unit.getAttackPosition(target);
                const allUnits = this.game.getUnits();
                const buildings = this.game.getBuildings();
                unit.calcPath(attackPos, allUnits, buildings);
                
                if (!this.movementIntervalId) {
                    this.startMovementCycle();
                }
            }
        });

        this.cleanupDestroyedEntities();
    }

    private cleanupDestroyedEntities(): void {
        const units = this.game.getUnits();
        const aliveUnits = units.filter(u => u.hp > 0);
        
        if (aliveUnits.length !== units.length) {
            this.game.setUnits(aliveUnits);
            console.log(`Удалено ${units.length - aliveUnits.length} уничтоженных юнитов`);
        }

        const buildings = this.game.getBuildings();
        const aliveBuildings = buildings.filter(b => b.hp > 0);
        
        if (aliveBuildings.length !== buildings.length) {
            this.game.setBuildings(aliveBuildings);
            console.log(`Удалено ${buildings.length - aliveBuildings.length} уничтоженных зданий`);
        }
    }

    public destructor(): void {
        if (this.combatIntervalId) {
            clearInterval(this.combatIntervalId);
            this.combatIntervalId = null;
        }
        super.destructor();
    }
}



export default Battle;