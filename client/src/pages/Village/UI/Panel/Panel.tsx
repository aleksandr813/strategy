import React from 'react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Store from '../../../../services/store/Store';
import Mediator from '../../../../services/mediator/Mediator';
import { PAGES } from '../../../PageManager';
import MiniMapCanvas from '../../../MiniMap/MiniMapCanvas';

import "./Panel.scss";

import build from "../../../../assets/img/panel/build.png";
import unit from "../../../../assets/img/panel/unit.png";
import map from "../../../../assets/img/panel/map.png";
import leaderboard from "../../../../assets/img/panel/leaderboard.png";
import settings from "../../../../assets/img/panel/settings.png";
import settings1 from "../../../../assets/img/panel/settings1.png";
import desk from "../../../../assets/img/panel/desk.png";
import home from "../../../../assets/img/panel/home.png";
import moneyIcon from "../../../../assets/img/panel/moneyIcon.png";
import rectangle from "../../../../assets/img/panel/rectangle.png";
import rectangle1 from "../../../../assets/img/panel/rectangle1.png";
import chat from "../../../../assets/img/panel/chat.png";
import sendarmy from "../../../../assets/img/panel/sendarmy.png";

interface PanelProps extends IBaseUIElement {
    store: Store;
    mediator: Mediator;
    setPage: (name: PAGES) => void;
}

const Panel: React.FC<PanelProps> = (props: PanelProps) => {
    const { setUIElement, store, mediator, setPage } = props;
    
    const [money, setMoney] = useState<number>(store.getMoney());

    useEffect(() => {
        const { MONEY_CHANGE } = mediator.getEventTypes();
        
        const handleMoneyChange = () => {
            setMoney(store.getMoney());
        };

        mediator.subscribe(MONEY_CHANGE, handleMoneyChange);

        return () => {
            mediator.unsubscribe(MONEY_CHANGE, handleMoneyChange);
        };
    }, [mediator, store]);

    const buildingsHandler = () => setUIElement(UIELEMENT.BUYBUILDINGSMENU);
    const unitsHandler = () => setUIElement(UIELEMENT.BUYUNITSMENU);    
    const settingsHandler = () => setUIElement(UIELEMENT.NULL);
    const globalmapHandler = () => setPage(PAGES.GLOBAL_MAP);
    const lidersHandler = () => setUIElement(UIELEMENT.NULL);
    const villageHandler = () => setUIElement(UIELEMENT.NULL);
    const chatHandler = () =>  setPage(PAGES.CHAT);
    const sendArmyHandler = () => setUIElement(UIELEMENT.ARMYMENU);

    return (
        <div className='Panel'>
            <img src={desk} className="panel-background" alt="bg" />

            <div className="panel-content">
                <div className='left-section'>
                    <Button onClick={villageHandler} className='panel-button big-btn' id='testpanelvillage'>
                        <img src={home} className='icon-img' alt="home" />
                    </Button>

                    <div className="info-column">
                        <div className="info-row top">
                            <img src={rectangle1} className='name-plate-bg' alt="plate" />
                        </div>
                        
                        <div className="info-row bottom">
                            <div className='money-container'>
                                <img src={rectangle} className='money-bg' alt="bg" />
                                <div className="money-content">
                                    <img src={moneyIcon} className='coin-icon' alt="gold" />
                                    <span className='money-value'>{money}</span>
                                </div>
                            </div>
                            <Button onClick={chatHandler} className='panel-button chat-btn' id='testpanelchat'>
                                <img src={chat} className='icon-img' alt="chat" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className='centr-section'>
                    <Button onClick={sendArmyHandler} className='panel-button-send-army' id='sendarmy'>
                        <img src={sendarmy} className='icon-img' alt="sendarmy" />  
                    </Button>
                </div>

                <div className='right-section'>
                    <div 
                        className='panel-button big-btn' 
                        title='Глобальная карта' 
                        id='testpanelmap' 
                        style={{ overflow: 'hidden' }} 
                    >
                        <MiniMapCanvas onMapClick={globalmapHandler} />
                    </div>

                    <div className='small-buttons-grid'>
                        <Button onClick={lidersHandler} className='panel-button-r mini-btn' title='Таблица лидеров'>
                            <img src={leaderboard} className='icon-img' alt="leaderboard" />
                        </Button>
                        
                        <Button onClick={buildingsHandler} className='panel-button-r mini-btn' title='Купить здание'>
                            <img src={build} className='icon-img' alt="build" />
                        </Button>

                        <Button onClick={settingsHandler} className='panel-button-r mini-btn' title='Настройки'>
                            <img src={settings} className='icon-img' alt="bg" />
                        </Button>

                        <Button onClick={unitsHandler} className='panel-button-r mini-btn' title='Купить юнитов'>
                            <img src={unit} className='icon-img' alt="units" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Panel;