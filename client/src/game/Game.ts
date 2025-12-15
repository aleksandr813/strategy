import EasyStar from 'easystarjs';
import Store from "../services/store/Store";
import Server from "../services/server/Server";
import Mediator from '../services/mediator/Mediator';
import GlobalMap from "./manager/GlobalMap";
import Village from "./manager/Village";
import Battle from "./manager/Battle";
import Unit from './entities/Unit';
import VillageEntity from './entities/VillageEntity';
import ArmyEntity from './entities/ArmyEntity';
import Building from './entities/Building';
import GAMECONFIG from './gameConfig';

class Game {
    private store: Store;
    private server: Server;
    private mediator: Mediator;
    private easyStar: EasyStar.js;
    
    private units: Unit[] = [];
    private buildings: Building[] = [];
    private villages: VillageEntity[] = [];
    private armies: ArmyEntity[] = [];
    
    private incomeInterval: NodeJS.Timer | null = null;
    
    public village: Village;
    public globalMap: GlobalMap;
    public battle: Battle;

    constructor(store: Store, server: Server, mediator: Mediator) {
        this.store = store;
        this.server = server;
        this.mediator = mediator;
        this.easyStar = new EasyStar.js();
        
        this.village = new Village(store, server, this.mediator, this.easyStar, this);
        this.globalMap = new GlobalMap(store, server, this);
        this.battle = new Battle(store, server, this);
        
        this.startIncomeUpdate();
    }

    private startIncomeUpdate(): void {
        this.updateIncome();
        
        this.incomeInterval = setInterval(() => {
            this.updateIncome();
        }, GAMECONFIG.INCOME_INTERVAL);
    }

    private async updateIncome(): Promise<void> {
        if (!this.store.user) return;
        await this.server.getIncome();
    }

    public getArmies(): ArmyEntity[] {
        return this.armies;
    }

    public setArmies(armies: ArmyEntity[]): void {
        this.armies = armies;
    }

    public getVillages(): VillageEntity[] {
        return this.villages;
    }

    public setVillages(villages: VillageEntity[]): void {
        this.villages = villages;
    }

    public getUnits(): Unit[] {
        return this.units;
    }

    public setUnits(units: Unit[]): void {
        this.units = units;
    }

    public addUnit(unit: Unit): void {
        this.units.push(unit);
    }

    public removeUnit(unit: Unit): void {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    }

    public getBuildings(): Building[] {
        return this.buildings;
    }

    public setBuildings(buildings: Building[]): void {
        this.buildings = buildings;
    }

    public addBuilding(building: Building): void {
        this.buildings.push(building);
    }

    public async removeBuilding(building: Building): Promise<void> {
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
        }
        await this.server.deleteBuilding(building.id);
    }

    public getEasyStar(): EasyStar.js {
        return this.easyStar;
    }

    public getVillage(): Village {
        return this.village;
    }

    public getGlobalMap(): GlobalMap {
        return this.globalMap;
    }

    public getBattle(): Battle {
        return this.battle;
    }

    public destructor(): void {
        if (this.incomeInterval) {
            clearInterval(this.incomeInterval);
            this.incomeInterval = null;
        }
        
        this.village.destructor();
        this.globalMap.destructor();
        this.battle.destructor();
    }
}

export default Game;