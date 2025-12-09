import React, { useEffect, useContext, useState } from 'react';
import { GameContext } from '../../../../App';
import { TUnitType } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Mediator from '../../../../services/mediator/Mediator';
import { BuildingTypeID } from '../../../../services/server/types';
import Store from '../../../../services/store/Store';

import './ArmyMenu.scss'

interface ArmyMenuProps extends IBaseUIElement {
    store: Store;
    mediator: Mediator
}

const ArmyMenu: React.FC<ArmyMenuProps> = (props: ArmyMenuProps) => {
    const game = useContext(GameContext);
    const village = game.getVillage();
    const { setUIElement, store } = props;

    const closeArmyMenu = () => setUIElement(UIELEMENT.NULL);

    return (
        <div>
            <div className='army-menu-overlay' onClick={closeArmyMenu}>
                <div className='army-menu-container' onClick={(e) => e.stopPropagation()} > </div>
            </div>
        </div>
    )
}

export default ArmyMenu;