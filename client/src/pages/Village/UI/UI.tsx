import React, { useState } from 'react';
import BuyBuildingsMenu from './BuyBuildingsMenu/BuyBuildingsMenu';
import BuyUnitsMenu from './BuyUnitsMenu/BuyUnitsMenu';
import BuildingMenu from './BuildingMenu/BuildingMenu';

import "./UI.scss";
import Panel from './Panel/Panel';

export enum UIELEMENT {
    //CHAT,
    SETTING,
    BUYUNITSMENU,
    BUYBUILDINGSMENU,
    NULL
}

export interface IBaseUIElement {
    setUIElement: (name: UIELEMENT) => void;
    money?: number;
}

interface UIProps {
    money?: number;
}

const UI: React.FC<UIProps> = ({money = 0}) => {

    const [uiElement, setUIElement] = useState<UIELEMENT>(UIELEMENT.NULL);
    
    return (
        <div className='UI'>
            <BuildingMenu></BuildingMenu>
            {uiElement === UIELEMENT.BUYBUILDINGSMENU && <BuyBuildingsMenu setUIElement={setUIElement} />}
            {uiElement === UIELEMENT.BUYUNITSMENU && <BuyUnitsMenu setUIElement={setUIElement} />}
            <Panel setUIElement={setUIElement} money={money}/>
        </div>
    );
};

export default UI;
