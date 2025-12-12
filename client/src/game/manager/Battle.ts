import Store from "../../services/store/Store";
import Server from "../../services/server/Server";
import Manager from "./Manager";
import Game from '../Game';

class Battle extends Manager {
    private store: Store;
    private server: Server;

    constructor(store: Store, server: Server, game: Game) {
        super(game);
        this.store = store;
        this.server = server;
    }
}

export default Battle;