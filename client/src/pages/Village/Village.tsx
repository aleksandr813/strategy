import React from 'react';
import { IBasePage } from '../PageManager';
import VillageCanvas from './VillageCanvas';
import UI from './UI/UI';

import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const Village: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage, store, mediator, server } = props;
    
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