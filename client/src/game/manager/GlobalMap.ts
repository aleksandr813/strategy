import Store from "../../services/store/Store";
import Server from "../../services/server/Server";
import VillageEntity from "../entities/VillageEntity";
import ArmyEntity from "../entities/ArmyEntity";
import Manager, { GameData } from "../manager/Manager";
import GAMECONFIG from '../gameConfig';

class GlobalMap extends Manager {
    private store: Store;
    private server: Server;
    private mapUpdateInterval: NodeJS.Timer | null = null;

    constructor(store: Store, server: Server, gameData: GameData) {
        super(gameData);
        this.store = store;
        this.server = server;
        
        this.startMapUpdate();
    }

    private startMapUpdate(): void {
        this.updateMap();
        
        this.mapUpdateInterval = setInterval(() => {
            this.updateMap();
        }, GAMECONFIG.MAP_UPDATE_INTERVAL);
    }

    private async updateMap(): Promise<void> {
        if (!this.store.user) return;
        const map = await this.server.getMap();
    }

    getMap() {
        return {
            armies: this.gameData.getArmies(),
            villages: this.gameData.getVillages(),
        };
    }

    destructor(): void {
        if (this.mapUpdateInterval) {
            clearInterval(this.mapUpdateInterval);
            this.mapUpdateInterval = null;
        }
    }
}

export default GlobalMap;