import EasyStar from 'easystarjs';
import Store from "../services/store/Store";
import Server from "../services/server/Server";
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
    private easyStar: EasyStar.js
    
    private units: Unit[] = [];
    private buildings: Building[] = [];

    private villages: VillageEntity[] = [];
    private armies: ArmyEntity[] = [];
    
    private incomeInterval: NodeJS.Timer | null = null;
    
    public village: Village;
    public globalMap: GlobalMap;
    public battle: Battle;

    constructor(store: Store, server: Server) {
        
        this.store = store;
        this.server = server;
        this.easyStar = new EasyStar.js();
        
        this.village = new Village(store, server, this.getGameData(), this.easyStar, this);
        this.globalMap = new GlobalMap(store, server, this.getGameData());
        this.battle = new Battle(store, server, this.getGameData());
        
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

    private removeUnit(unit: Unit): void {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    }

    private async removeBuilding(building: Building): Promise<void> {
        await this.server.deleteBuilding(building.id);
    }

    protected getGameData() {
        return {
            getArmies: () => this.armies,
            getVillages: () => this.villages,
            setArmies: (armies: ArmyEntity[]) => { this.armies = armies; },
            setVillages: (villages: VillageEntity[]) => { this.villages = villages;},
            getUnits: () => this.units,
            getBuildings: () => this.buildings,
            setUnits: (units: Unit[]) => { this.units = units; },
            setBuildings: (buildings: Building[]) => { this.buildings = buildings; },
            addUnit: (unit: Unit) => { this.units.push(unit); },
            addBuilding: (building: Building) => { this.buildings.push(building); },
            removeUnit: (unit: Unit) => this.removeUnit(unit),
            removeBuilding: (building: Building) => this.removeBuilding(building)
        };
    }

    public getEasyStar(): EasyStar.js {
        return this.easyStar;
    }

    getVillage(): Village {
        return this.village;
    }

    getGlobalMap(): GlobalMap {
        return this.globalMap;
    }

    getBattle(): Battle {
        return this.battle;
    }

    getUnits(): Unit[] {
        return this.units;
    }

    getBuildings(): Building[] {
        return this.buildings;
    }

    destructor(): void {
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