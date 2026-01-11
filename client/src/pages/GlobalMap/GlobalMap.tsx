import React from 'react';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import GlobalMapCanvas from './GlobalMapCanvas';
import UI from './UI/UI';

import "./GlobalMap.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const GlobalMap: React.FC<IBasePage> = (props: IBasePage) => {

    const { setPage, store, mediator, game } = props;
    
    const VillageClickHandler = () => {
        game.globalMap.sendingArmy = false;
        setPage(PAGES.VILLAGE);
    }

    return (
        <div className='game'>
            <div>
                <GlobalMapCanvas />
                <UI 
                    store={store} 
                    mediator={mediator} 
                    setPage={setPage} 
                    game={game}
                />
                <Button className='back-to-village-button bottom-right' onClick={VillageClickHandler} text="Назад"/>
            </div>
        </div>
    );
};

export default GlobalMap;