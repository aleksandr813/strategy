import React, { useState, useEffect } from 'react';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Server from '../../../../services/server/Server';
import Store from '../../../../services/store/Store';
import Mediator from '../../../../services/mediator/Mediator';
import { PAGES } from '../../../PageManager';
import MiniMapCanvas from '../../../MiniMap/MiniMapCanvas';

import "./Panel.scss";

import build from "../../../../assets/img/panel/build.png";
import unit from "../../../../assets/img/panel/unit.png";
import leaderboard from "../../../../assets/img/panel/leaderboard.png";
import settings from "../../../../assets/img/panel/settings.png";
import desk from "../../../../assets/img/panel/desk.png";
import moneyIcon from "../../../../assets/img/panel/moneyIcon.png";
import chat from "../../../../assets/img/panel/chat.png";
import sendarmy from "../../../../assets/img/panel/sendarmy.png";
import pupa from "../../../../assets/img/panel/pupa.png";
import lupa from "../../../../assets/img/panel/lupa.png";

interface PanelProps extends IBaseUIElement {
    server: Server;
    store: Store;
    mediator: Mediator;
    setPage: (name: PAGES) => void;
}

const Panel: React.FC<PanelProps> = (props: PanelProps) => {
    const { setUIElement, store, mediator, setPage } = props;
    const [money, setMoney] = useState<number>(store.getMoney());
    const playerName = store.getUser()?.name;

    useEffect(() => {
        const { MONEY_CHANGE } = mediator.getEventTypes();
        const handleMoneyChange = () => setMoney(store.getMoney());

        mediator.subscribe(MONEY_CHANGE, handleMoneyChange);
        return () => mediator.unsubscribe(MONEY_CHANGE, handleMoneyChange);
    }, [mediator, store]);

    const buildingsHandler = () => setUIElement(UIELEMENT.BUYBUILDINGSMENU);
    const unitsHandler = () => setUIElement(UIELEMENT.BUYUNITSMENU);
    const settingsHandler = () => setUIElement(UIELEMENT.NULL);
    const globalmapHandler = () => setPage(PAGES.GLOBAL_MAP);
    const lidersHandler = () => setUIElement(UIELEMENT.NULL);
    const chatHandler = () => setPage(PAGES.CHAT);
    const sendArmyHandler = () => setUIElement(UIELEMENT.ARMYMENU);

    return (
        <div className='Panel'>
            <img src={desk} className="panel-background" alt="bg" />

            <div className="panel-content">
                <div className="left-section">
                    <Button onClick={sendArmyHandler} className="panel-button-send-army">
                        <img src={sendarmy} className="icon-img" alt="sendarmy" />
                    </Button>

                    <div className="info-tower">
                        <Button
                            onClick={() => setUIElement(UIELEMENT.ACTIVEBATTLESMENU)}
                            className="battles-btn"
                            title="Активные бои"
                        >
                            <div className="battles-overlay">
                                <img src={pupa} className="battles-bg" alt="panel background" />
                                <span className="battles-text">Активные бои</span>
                            </div>
                        </Button>

                        <div className="money-container">
                            <img src={pupa} className="money-bg" alt="bg" />
                            <div className="money-content">
                                <img src={moneyIcon} className="coin-icon" alt="gold" />
                                <span className="money-value">{money}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="centr-section">
                    <Button
                        onClick={chatHandler}
                        className="chat-btn-central"
                        title="Чат"
                    >
                        <img src={chat} className="icon-img" alt="chat" />
                    </Button>

                    <div className="player-panel">
                        <img src={lupa} className="player-lupa-bg" alt="player panel" />
                        <span className="player-nick">НИК: {playerName}</span>
                    </div>
                </div>

                <div className='right-section'>
                    <div className='panel-button big-btn' title='Глобальная карта' id='testpanelmap'>
                        <MiniMapCanvas onMapClick={globalmapHandler} />
                    </div>

                    <div className='small-buttons-grid'>
                        <Button onClick={lidersHandler} className='panel-button-r' title='Таблица лидеров'>
                            <img src={leaderboard} className='icon-img' alt="leaderboard" />
                        </Button>

                        <Button onClick={buildingsHandler} className='panel-button-r' title='Купить здание'>
                            <img src={build} className='icon-img' alt="build" />
                        </Button>

                        <Button onClick={settingsHandler} className='panel-button-r' title='Настройки'>
                            <img src={settings} className='icon-img' alt="settings" />
                        </Button>

                        <Button onClick={unitsHandler} className='panel-button-r' title='Купить юнитов'>
                            <img src={unit} className='icon-img' alt="units" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Panel;