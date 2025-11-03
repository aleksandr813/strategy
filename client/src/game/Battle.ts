import Manager, { GameDataInterface } from "./Manager";
import Store from "../services/store/Store";
import Server from "../services/server/Server";

class Battle extends Manager {
    private store: Store;
    private server: Server;

    constructor(store: Store, server: Server, gameData: GameDataInterface) {
        super(gameData);
        this.store = store;
        this.server = server;
    }
}

export default Battle;