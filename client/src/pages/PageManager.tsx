import React, { useState } from 'react';

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
    setPage: (name: PAGES) => void
}

const PageManager: React.FC = () => {
    const [page, setPage] = useState<PAGES>(PAGES.PRELOADER);

    return (
        <>
            {page === PAGES.PRELOADER && <Preloader setPage={setPage} />}
            {page === PAGES.LOGIN && <Login setPage={setPage} />}
            {page === PAGES.REGISTRATION && <Registration setPage={setPage} />}
            {page === PAGES.CHAT && <Chat setPage={setPage} />}
            {page === PAGES.VILLAGE && <Village setPage={setPage} />}
            {page === PAGES.CALCULATOR && <Calculator setPage={setPage} />}
            {page === PAGES.BATTLE && <Battle setPage={setPage} />}
            {page === PAGES.GLOBAL_MAP && <GlobalMap setPage={setPage} />}
            {page === PAGES.NOT_FOUND && <NotFound setPage={setPage} />}
        </>
    );
}

export default PageManager;