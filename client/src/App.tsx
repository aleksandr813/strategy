import React from 'react';
import Store from './services/store/Store';
import Server from './services/server/Server';
import Popup from './components/Popup/Popup';
import PageManager from './pages/PageManager';
import Village from './game/Village';

import './App.scss';

export const StoreContext = React.createContext<Store>(null!);
export const ServerContext = React.createContext<Server>(null!);
export const VillageContext = React.createContext<Village>(null!);

const App: React.FC = () => {
    const store = new Store();
    const server = new Server(store);
    const village = new Village(store, server);

    return (
        <StoreContext.Provider value={store}>
            <ServerContext.Provider value={server}>
                <VillageContext.Provider value={village}>
                    <div className='app'>
                        <Popup />
                        <PageManager />
                    </div>
                </VillageContext.Provider>
            </ServerContext.Provider>
        </StoreContext.Provider>
    );
}

export default App;
