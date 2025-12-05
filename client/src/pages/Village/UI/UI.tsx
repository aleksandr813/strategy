import React, { useState } from 'react';
import BuyBuildingsMenu from './BuyBuildingsMenu/BuyBuildingsMenu';
import BuyUnitsMenu from './BuyUnitsMenu/BuyUnitsMenu';
import BuildingMenu from './BuildingMenu/BuildingMenu';
import Store from '../../../services/store/Store';
import { PAGES } from '../../PageManager';

import "./UI.scss";
import Panel from './Panel/Panel';

export enum UIELEMENT {
    SETTING,
    BUYUNITSMENU,
    BUYBUILDINGSMENU,
    NULL
}

export interface IBaseUIElement {
    setUIElement: (name: UIELEMENT) => void
}

interface UIProps {
    store: Store;
    setPage: (name: PAGES) => void;
}

const UI: React.FC<UIProps> = ({ store, setPage }) => {
    const [uiElement, setUIElement] = useState<UIELEMENT>(UIELEMENT.NULL);

    return (
        <div className='UI'>
            <BuildingMenu></BuildingMenu>
            {uiElement === UIELEMENT.BUYBUILDINGSMENU && <BuyBuildingsMenu setUIElement={setUIElement} store={store} />}
            {uiElement === UIELEMENT.BUYUNITSMENU && <BuyUnitsMenu setUIElement={setUIElement} store={store} />}
            <Panel setUIElement={setUIElement} store={store} setPage={setPage} />
        </div>
    );
};

export default UI;