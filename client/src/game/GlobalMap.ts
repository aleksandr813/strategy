import Manager, { GameData } from "./Manager";
import Store from "../services/store/Store";
import Server from "../services/server/Server";

class GlobalMap extends Manager {
    private store: Store;

    constructor(store: Store, server: Server, gameData: GameData) {
        super(gameData,server);
        this.store = store;
    }
}

export default GlobalMap;