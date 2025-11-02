import GlobalMap from "./GlobalMap";
import Village from "./Village";
import Battle from "./Battle";
import Store from "../services/store/Store";
import Server from "../services/server/Server";

class Game {
    private store: Store;
    private server: Server;
    
    public village: Village;
    public globalMap: GlobalMap;
    public battle: Battle;

    constructor(store: Store, server: Server) {
        this.store = store;
        this.server = server;
        
        this.village = new Village(store, server);
        this.globalMap = new GlobalMap(store, server);
        this.battle = new Battle(store, server);
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

    destructor(): void {
        this.village.destructor();
        this.globalMap.destructor();
        this.battle.destructor();
    }
}

export default Game;