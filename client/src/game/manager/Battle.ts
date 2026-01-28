import Store from "../../services/store/Store";
import Server from "../../services/server/Server";
import Manager from "./Manager";
import Game from '../Game';
import Unit from '../entities/Unit';
import Building from '../entities/Building';
import EasyStar from 'easystarjs';

class Battle extends Manager {
    private store: Store;
    private server: Server;
    private easyStar: EasyStar.js;
    
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

}

export default Battle;