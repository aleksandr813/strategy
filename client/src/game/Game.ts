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
        
        // Создаём экземпляры всех менеджеров
        this.village = new Village(store, server);
        this.globalMap = new GlobalMap(store, server);
        this.battle = new Battle(store, server);
    }

    // Методы для доступа к менеджерам
    getVillage(): Village {
        return this.village;
    }

    getGlobalMap(): GlobalMap {
        return this.globalMap;
    }

    getBattle(): Battle {
        return this.battle;
    }

    // Общий метод очистки ресурсов
    destructor(): void {
        this.village.destructor();
        this.globalMap.destructor();
        this.battle.destructor();
    }
}

export default Game;