import React from 'react';
import Store from './services/store/Store';
import Server from './services/server/Server';
import Popup from './components/Popup/Popup';
import PageManager from './pages/PageManager';
import Game from './game/Game';

import './App.scss';

export const StoreContext = React.createContext<Store>(null!);
export const ServerContext = React.createContext<Server>(null!);
export const GameContext = React.createContext<Game>(null!);

const App: React.FC = () => {
    const store = new Store();
    const server = new Server(store);
    const game = new Game(store, server);

    return (
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
    );
}

export default App;
