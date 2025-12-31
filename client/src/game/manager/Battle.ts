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

    async loadBuildings(): Promise<void> {
        console.log("Загружаем здания битвы из сервера...");

        const battleData = await this.server.getBattle();
        if (!battleData) {
            console.log('Нет данных битвы для загрузки');
            return;
        }

        const buildingTypes = await this.server.getBuildingTypes();
        if (!buildingTypes) {
            console.error('Не удалось загрузить типы зданий');
            return;
        }

        const buildingsData = battleData.battle.buildings;
        if (!buildingsData || buildingsData.length === 0) {
            console.log('Нет зданий в битве для загрузки');
            return;
        }

        const buildings = buildingsData.map(buildingData => {
            const typeData = buildingTypes.find(type => type.id === buildingData.typeId);

            let size = 2;
            if (buildingData.typeId === 4) {
                size = 1;
            }

            const building = new Building(
                buildingData.id,
                buildingData.type,
                buildingData.currentHp,
                buildingData.currentHp,
                buildingData.level,
                size,
                buildingData.typeId,
                buildingData.x,
                buildingData.y,
                buildingData.unlockLevel,
                undefined,
                typeData
            );

            if (typeData && !building.typeData) {
                building.setTypeData(typeData);
            }

            return building;
        });

        this.game.setBuildings(buildings);
        console.log("Загружено зданий в битве:", this.game.getBuildings().length);
    }

    async loadUnits(): Promise<void> {
        console.log("Загружаем юнитов битвы из сервера...");

        const battleData = await this.server.getBattle();
        if (!battleData) {
            console.log('Нет данных битвы для загрузки');
            return;
        }

        const unitsData = battleData.battle.units;
        if (!unitsData || unitsData.length === 0) {
            console.log('Нет юнитов в битве для загрузки');
            return;
        }

        const units = unitsData.map(unitData => 
            new Unit(unitData, this.game, this.easyStar)
        );

        this.game.setUnits(units);
        console.log("Загружено юнитов в битве:", this.game.getUnits().length);
    }

    async loadBattle(): Promise<void> {
        console.log("Загружаем данные битвы...");
        await this.loadBuildings();
        await this.loadUnits();
    }
}

export default Battle;