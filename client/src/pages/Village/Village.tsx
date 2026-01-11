import React, { useContext } from 'react';
import { ServerContext, StoreContext, MediatorContext } from '../../App';
import { IBasePage } from '../PageManager';
import VillageCanvas from './VillageCanvas';
import UI from './UI/UI';

import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const Village: React.FC<IBasePage> = (props: IBasePage) => {
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const mediator = useContext(MediatorContext);
    
    const { setPage } = props;
    
    return (
    <div className='game'>
        <div>
            <VillageCanvas />
        </div>
        <UI server={server} store={store} mediator={mediator} setPage={setPage} />
    </div>
);
};

export default Village;