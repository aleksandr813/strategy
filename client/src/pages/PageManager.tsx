import React, { useState, useContext } from 'react';

import { GameContext, MediatorContext, ServerContext, StoreContext } from '../App';
import Server from '../services/server/Server';
import Store from '../services/store/Store';
import Mediator from '../services/mediator/Mediator';
import Game from '../game/Game';


import Preloader from './Preloader/Preloader';
import Login from './Login/Login';
import Registration from './Registration/Registration';
import Chat from './Chat/Chat';
import Battle from './Battle/Battle';
import Calculator from './Calculator/Calculator';
import GlobalMap from './GlobalMap/GlobalMap';
import Village from './Village/Village';
import NotFound from './NotFound/NotFound';

export enum PAGES {
    PRELOADER,
    LOGIN,
    REGISTRATION,
    CHAT,
    GAME,
    CALCULATOR,
    BATTLE,
    GLOBAL_MAP,
    VILLAGE,
    NOT_FOUND,
}

export interface IBasePage {
    setPage: (name: PAGES) => void;
    server: Server;
    store: Store;
    mediator: Mediator;
    game: Game;
}

const PageManager: React.FC = () => {
    const [page, setPage] = useState<PAGES>(PAGES.PRELOADER);

    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const mediator = useContext(MediatorContext);
    const game = useContext(GameContext);

    const props = {
        server,
        store,
        mediator,
        game,
        setPage
    }

    return (
        <>
            {page === PAGES.BATTLE && <Battle {...props} />}
            {page === PAGES.PRELOADER && <Preloader {...props} />}
            {page === PAGES.LOGIN && <Login {...props} />}
            {page === PAGES.REGISTRATION && <Registration {...props} />}
            {page === PAGES.CHAT && <Chat {...props} />}
            {page === PAGES.VILLAGE && <Village {...props} />}
            {page === PAGES.CALCULATOR && <Calculator {...props} />}
            {page === PAGES.GLOBAL_MAP && <GlobalMap {...props} />}
            {page === PAGES.NOT_FOUND && <NotFound {...props} />}
        </>
    );
}

export default PageManager;