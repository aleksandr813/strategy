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
    private attackIntervalId: NodeJS.Timeout | null = null;
    
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
    }
    
    private initializePathfinding(): void {
        const units = this.game.getUnits();
        const buildings = this.game.getBuildings();
        
        const matrix = this.game.getMatrixForEasyStar(units, buildings);
        
        this.easyStar.setGrid(matrix);
        
        this.easyStar.setAcceptableTiles([0, 2]);
        console.log('Pathfinding initialized with matrix:', matrix.length, 'x', matrix[0]?.length);
    }

    private startAttackCycle() {
        this.attackIntervalId = setInterval(()=>{
            
        })
    }
}

export default Battle;