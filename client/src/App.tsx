import React from 'react';
import CONFIG from './config';
import useStore from './hooks/useStore';
import Store from './services/store/Store';
import Server from './services/server/Server';
import Mediator from './services/mediator/Mediator';
import Popup from './components/Popup/Popup';
import PageManager from './pages/PageManager';
import Game from './game/Game';


import './App.scss';

const { MEDIATOR } = CONFIG;

export const StoreContext = React.createContext<Store>(null!);
export const ServerContext = React.createContext<Server>(null!);
export const GameContext = React.createContext<Game>(null!);
export const MediatorContext = React.createContext<Mediator>(null!);

const App: React.FC = () => {
    const mediator = new Mediator(MEDIATOR);
    const store = new Store(mediator);
    useStore({mediator: mediator, storage: store})
    const server = new Server(store);
    const game = new Game(store, server, mediator);

    return (
        <MediatorContext.Provider value={mediator}>
            <StoreContext.Provider value={store}>
                <ServerContext.Provider value={server}>
                    <GameContext.Provider value={game}>
                        <div className='app'>
                            <Popup />
                            <PageManager />
                        </div>
                    </GameContext.Provider>
                </ServerContext.Provider>
            </StoreContext.Provider>
        </MediatorContext.Provider>
    );
}

export default App;
