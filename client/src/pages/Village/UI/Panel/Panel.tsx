import React from 'react';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';

import "./Panel.scss";

import build from "../../../../assets/img/panel/build.png";
import unit from "../../../../assets/img/panel/unit.png";
import map from "../../../../assets/img/panel/map.png";
import leaderboard from "../../../../assets/img/panel/leaderboard.png";
import settings from "../../../../assets/img/panel/settings.png";
import desk from "../../../../assets/img/panel/desk.png";
import home from "../../../../assets/img/panel/home.png";
import moneyIcon from "../../../../assets/img/panel/moneyIcon.png";
import rectangle from "../../../../assets/img/panel/rectangle.png";
import chat from "../../../../assets/img/panel/chat.png";
import icon from "../../../../assets/img/panel/icon.png";




const Panel: React.FC<IBaseUIElement> = (props: IBaseUIElement) => {

    const { setUIElement, money = 0 } = props;

    React.useEffect(() => {
        console.log('Panel: received money:', money);
    }, [money]);

    const buildingsHandler = () => setUIElement(UIELEMENT.BUYBUILDINGSMENU);
    const unitsHandler = () => setUIElement(UIELEMENT.BUYUNITSMENU);    
    const settingsHandler = () => setUIElement(UIELEMENT.NULL);
    const globalmapHandler = () => setUIElement(UIELEMENT.NULL);
    const lidersHandler = () => setUIElement(UIELEMENT.NULL);
    const villageHandler = () => setUIElement(UIELEMENT.NULL);
    const chatHandler = () => setUIElement(UIELEMENT.NULL);


    return (
        <div className='Panel'>
            <img src={desk} className="panel-background" />
            <div className='buttons1'>

                <div className='button-group'>
                    <Button onClick={globalmapHandler} className='panel-button max' title='Глобальная карта' id='testpanelmap'>
                        <img src={map} className='max' />
                    </Button>
                </div>

                <div className='button-group'>
                    <Button onClick={lidersHandler} className='panel-button mini' title='Таблица лидеров' id='testpanelleaderboard'>
                        <img src={leaderboard} className='max' />
                    </Button>
                    <Button onClick={settingsHandler} className='panel-button mini' title='Настройки' id='testpanelsettings'>
                        <img src={settings} className='max' />
                    </Button>
                </div>

                <div className='button-group'>
                    <Button onClick={buildingsHandler} className='panel-button mini' title='Купить здание' id='testpanelhouses'>
                        <img src={build} className='max' />
                    </Button>
                    <Button onClick={unitsHandler} className='panel-button mini' title='Купить юнитов' id='testpanelunits'>
                        <img src={unit} className='max' />
                    </Button>
                </div>
            </div>
            <div className='buttons2'>
                <div className='button-group'>
                    <div className='param'>
                        <Button onClick={villageHandler} className='panel-button mini' id='testpanelvillage'>
                            <img src={home} className='max' />
                        </Button>
                        <img src={rectangle} className='rectangle' />
                    </div>
                    <div className='param'>
                        <img src={moneyIcon} className='money' />
                        <span className="money-text">{money}</span>
                        <img src={rectangle} className='rectangle' />
                        <img src={chat} className='chat-panel' />
                    </div>
                </div>

                <div className='button-group'>
                    <div className='param'>
                        <img src={icon} className='icon' />
                        <img src={rectangle} className='rectangle' />
                    </div>
                    <div className='param'>
                        <img src={icon} className='icon' />
                        <img src={rectangle} className='rectangle' />
                    </div>
                </div>

            </div>

        </div>
    )
}
export default Panel;