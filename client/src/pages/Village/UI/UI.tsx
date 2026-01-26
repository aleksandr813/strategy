import React, { useState } from 'react';
import BuyBuildingsMenu from './BuyBuildingsMenu/BuyBuildingsMenu';
import BuyUnitsMenu from './BuyUnitsMenu/BuyUnitsMenu';
import BuildingMenu from './BuildingMenu/BuildingMenu';
import Panel from './Panel/Panel';
import ArmyMenu from './ArmyMenu/ArmyMenu';
import Server from '../../../services/server/Server';
import Store from '../../../services/store/Store';
import Mediator from '../../../services/mediator/Mediator';
import { PAGES } from '../../PageManager';
import ActiveBattlesMenu from './ActiveBattlesMenu/ActiveBattlesMenu';
import BattleEndMenu from '../../GlobalMap/UI/BattleEndMenu/BattleEndMenu';

import "./UI.scss";


export enum UIELEMENT {
    SETTING,
    BUYUNITSMENU,
    BUYBUILDINGSMENU,
    ARMYMENU,
    ACTIVEBATTLESMENU,
    BATTLE_END_MENU,
    NULL
}

export interface IBaseUIElement {
    setUIElement: (name: UIELEMENT) => void
}

interface UIProps {
    server: Server;
    store: Store;
    mediator: Mediator;
    setPage: (name: PAGES) => void;
}

const UI: React.FC<UIProps> = ({ server, store, mediator, setPage }) => {
    const [uiElement, setUIElement] = useState<UIELEMENT>(UIELEMENT.NULL);

    return (
        <div className='UI'>
            {uiElement === UIELEMENT.BATTLE_END_MENU && (
                <BattleEndMenu 
                    setUIElement={setUIElement} 
                    setPage={setPage} 
                    store={store} 
                    isWinner={true} 
                    loot={{ gold: 1000 }}
                />
            )}
            <BuildingMenu mediator={mediator} />
            {uiElement === UIELEMENT.BUYBUILDINGSMENU && <BuyBuildingsMenu setUIElement={setUIElement} store={store} mediator={mediator} />}
            {uiElement === UIELEMENT.BUYUNITSMENU && <BuyUnitsMenu setUIElement={setUIElement} store={store} mediator={mediator} />}
            {uiElement === UIELEMENT.ARMYMENU && <ArmyMenu setPage={setPage} setUIElement={setUIElement} store={store} mediator={mediator} />}
            {uiElement === UIELEMENT.ACTIVEBATTLESMENU && <ActiveBattlesMenu setUIElement={setUIElement} store={store} setPage={setPage} mediator={mediator} />}
            <Panel setUIElement={setUIElement} server={server} store={store} mediator={mediator} setPage={setPage} />
        </div>
    );
};

export default UI;