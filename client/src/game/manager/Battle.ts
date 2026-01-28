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

    private damageToUnits: Record<number, number> = {};
    private damageToBuildings: Record<number, number> = {};
    private changedUnits: Set<number> = new Set();
    
    constructor(store: Store, server: Server, game: Game, easyStar: EasyStar.js) {
        super(game);
        this.store = store;
        this.server = server;
        this.easyStar = easyStar;
    }

    async loadBattle(): Promise<void> {
        const currentBattleId = this.game.getCurrentBattle();
        if (!currentBattleId) return;

        const response = await this.server.getBattle(currentBattleId);
        if (!response?.battleData) return;

        await this.loadBuildings(response.battleData.buildings);
        await this.loadUnits(response.battleData);
        
        this.initializePathfinding();
        this.startLoops();
    }

    private startLoops() {
        this.combatIntervalId = setInterval(() => this.processCombat(), Battle.COMBAT_INTERVAL);
        this.updateBattleIntervalId = setInterval(() => this.sendBattleUpdate(), Battle.UPDATE_BATTLE_INTERVAL);
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
        } else {
            this.moveUnits({ x: gridX, y: gridY }, this.game.getUnits(), this.game.getBuildings(), this.server);
        }
    }

    private attackTarget(units: Unit[], target: IAttackable): void {
        units.forEach(unit => {
            unit.setTarget(target);
            unit.calcPath(unit.getAttackPosition(target), this.game.getUnits(), this.game.getBuildings());
        });
        if (!this.movementIntervalId) this.startMovementCycle();
    }

    private recordAttack(attackerId: number, targetId: number, isBuilding: boolean) {
        if (isBuilding) {
            this.damageToBuildings[attackerId] = targetId;
        } else {
            this.damageToUnits[attackerId] = targetId;
        }
        this.changedUnits.add(attackerId);
    }

    private async sendBattleUpdate() {
        const battleId = this.game.getCurrentBattle();
        const hasChanges = this.changedUnits.size > 0 || 
                          Object.keys(this.damageToUnits).length > 0 || 
                          Object.keys(this.damageToBuildings).length > 0;

        if (!battleId || !hasChanges) return;

        const unitsToUpdate = this.game.getUnits().filter(u => u.isMyUnit() && this.changedUnits.has(u.id));

        const success = await this.server.updateBattle(
            battleId,
            unitsToUpdate,
            this.damageToUnits,
            this.damageToBuildings
        );

        if (success) {
            this.damageToUnits = {};
            this.damageToBuildings = {};
            this.changedUnits.clear();
        }
    }

    private processCombat() {
        this.game.getUnits().forEach(unit => {
            if (!unit.isMyUnit() || !unit.hasTarget()) return;

            const target = unit.getTarget();
            if (!target || target.hp <= 0) {
                unit.clearTarget();
                return;
            }

            if (unit.isInAttackRange(target)) {
                const isBuilding = target instanceof Building;
                this.recordAttack(unit.id, target.id, isBuilding);
                unit.attack(target);
            } else if (!unit.isMoving()) {
                unit.calcPath(unit.getAttackPosition(target), this.game.getUnits(), this.game.getBuildings());
                if (!this.movementIntervalId) this.startMovementCycle();
            }
        });
        this.cleanupDestroyed();
    }

    private async loadBuildings(data: any[]) {
        const types = await this.server.getBuildingTypes();
        const buildings = data.map((b: any) => new Building(
            Number(b.id), b.type, Number(b.currentHp), Number(b.currentHp),
            Number(b.level), b.size, Number(b.typeId), Number(b.x), Number(b.y),
            Number(b.unlockLevel), undefined, types?.find(t => t.id === b.typeId)
        ));
        this.game.setBuildings(buildings);
    }

    private async loadUnits(data: any) {
        const create = (list: any[], side: 'ally'|'enemy') => list.map(u => {
            const unit = new Unit({...u, x: Number(u.x), y: Number(u.y)}, this.game, this.easyStar, side);
            if (unit.isMyUnit()) unit.onChanged = (id) => this.changedUnits.add(id);
            return unit;
        });
        this.game.setUnits([...create(data.alliedUnits, 'ally'), ...create(data.enemyUnits, 'enemy')]);
    }

    private initializePathfinding() {
        this.easyStar.setGrid(this.game.getMatrixForEasyStar(this.game.getUnits(), this.game.getBuildings()));
        this.easyStar.setAcceptableTiles([0, 2]);
    }

    private cleanupDestroyed() {
        this.game.setUnits(this.game.getUnits().filter(u => u.hp > 0));
        this.game.setBuildings(this.game.getBuildings().filter(b => b.hp > 0));
    }

    public destructor() {
        if (this.combatIntervalId) clearInterval(this.combatIntervalId);
        if (this.updateBattleIntervalId) clearInterval(this.updateBattleIntervalId);
        super.destructor();
    }
}

export default Battle;