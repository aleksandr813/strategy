import Manager from "./Manager";
import Store from "../services/store/Store";
import Server from "../services/server/Server";

class GlobalMap extends Manager {
    private store: Store;
    private server: Server;

    constructor(store: Store, server: Server) {
        super();
        this.store = store;
        this.server = server;
    }
}

export default GlobalMap