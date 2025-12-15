import React, { useState } from 'react';
import VillageMenu from './VillageMenu/VillageMenu';
import Store from '../../../services/store/Store';
import Mediator from '../../../services/mediator/Mediator';
import { PAGES } from '../../PageManager';
import Game from '../../../game/Game';

import "./UI.scss";

export enum GLOBALMAP_UIELEMENT {
    VILLAGEMENU,
    SETTINGS,
    NULL
}

export interface IBaseGlobalMapUIElement {
    setUIElement: (name: GLOBALMAP_UIELEMENT) => void
}

interface GlobalMapUIProps {
    store: Store;
    mediator: Mediator;
    setPage: (name: PAGES) => void;
    game: Game;
}

const UI: React.FC<GlobalMapUIProps> = ({ store, mediator, setPage, game }) => {
    const [uiElement, setUIElement] = useState<GLOBALMAP_UIELEMENT>(GLOBALMAP_UIELEMENT.NULL);

    return (
        <div className='GlobalMapUI'>
            <VillageMenu setPage={setPage} setUIElement={setUIElement} mediator={mediator} game={game} />
        </div>
    );
};

export default UI;