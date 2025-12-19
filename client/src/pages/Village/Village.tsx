import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import { ServerContext, StoreContext, MediatorContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import VillageCanvas from './VillageCanvas';
import MiniMapCanvas from '../MiniMap/MiniMapCanvas';
import UI from './UI/UI';



import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const Village: React.FC<IBasePage> = (props: IBasePage) => {
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const mediator = useContext(MediatorContext);
    const token = store.getToken();
    
    const { setPage } = props;
    
    const backClickHandler = async () => {
        if (token && await server.logout(token)) {
            setPage(PAGES.LOGIN)
        }
    };
    const BattleClickHandler = () => setPage(PAGES.BATTLE);
    const CalculatorClickHandler = () => setPage(PAGES.CALCULATOR);
    const GlobalMapClickHandler = () => setPage(PAGES.GLOBAL_MAP);
    const VillageClickHandler = () => setPage(PAGES.VILLAGE);
    const chatClickHandler = () => setPage(PAGES.CHAT);

    return (
    <div className='game'>
        <div>
            <VillageCanvas />
        </div>
        <UI store={store} mediator={mediator} setPage={setPage} />
    </div>
);
};

export default Village;