import GlobalMap from "./GlobalMap";
import Village from "./Village";
import Battle from "./Battle";
import Store from "../services/store/Store";
import Server from "../services/server/Server";
import Unit from './Entities/Unit';
import Building from './Entities/Building';

class Game {
    private store: Store;
    private server: Server;
    
    private units: Unit[] = [];
    private buildings: Building[] = [];

    private money: number = 0;

    private moneyUpdateCallbacks: ((money: number) => void)[] = [];
    
    public village: Village;
    public globalMap: GlobalMap;
    public battle: Battle;

    constructor(store: Store, server: Server) {
        this.store = store;
        this.server = server;
        
        this.village = new Village(store, server, this.getGameData());
        this.globalMap = new GlobalMap(store, server, this.getGameData());
        this.battle = new Battle(store, server, this.getGameData());
    }

    private removeUnit(unit: Unit): void {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    }

    private removeBuilding(building: Building): void {
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
        }
    }

    private getGameData() {
        return {
            getUnits: () => this.units,
            getBuildings: () => this.buildings,
            setUnits: (units: Unit[]) => { this.units = units; },
            setBuildings: (buildings: Building[]) => { this.buildings = buildings; },
            addUnit: (unit: Unit) => { this.units.push(unit); },
            addBuilding: (building: Building) => { this.buildings.push(building); },
            removeUnit: (unit: Unit) => this.removeUnit(unit),
            removeBuilding: (building: Building) => this.removeBuilding(building),
            getMoney: () => this.money,
            setMoney: (money: number) => {this.money = money;},
        };
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

    getMoney(): number {
        console.log('Game: getMoney called, returning:', this.money);
        return this.money;
    }

    setMoney(money: number): void {
        console.log('Game: setting money to', money);
        this.money = money;
        this.moneyUpdateCallbacks.forEach(callback => callback(money));
    }

    onMoneyUpdate(callback: (money: number) => void): void {
        this.moneyUpdateCallbacks.push(callback);
    }

    removeMoneyListener(callback: (money: number) => void): void {
        const index = this.moneyUpdateCallbacks.indexOf(callback);
        if (index > -1) {
            this.moneyUpdateCallbacks.splice(index, 1);
        }
    }

    destructor(): void {
        this.village.destructor();
        this.globalMap.destructor();
        this.battle.destructor();

        this.moneyUpdateCallbacks = [];
    }
}

export default Game;