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
    constructor(store: Store, server: Server, game: Game) {
        super(game);
        this.store = store;
        this.server = server;
        this.easyStar = new EasyStar.js();
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
        const units = [
            ...battleData.alliedUnits,
            ...battleData.enemyUnits
        ].map((u: any) => new Unit(u, this.game, this.easyStar));

        this.game.setUnits(units);
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
    }

}

export default Battle;