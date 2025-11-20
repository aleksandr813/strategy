import Manager, { GameData } from "./Manager";
import Store from "../../services/store/Store";
import Server from "../../services/server/Server";

class Battle extends Manager {
    private store: Store;

    constructor(store: Store, server: Server, gameData: GameData) {
        super(gameData, server);
        this.store = store;
        this.server = server;
    }
}

export default Battle;