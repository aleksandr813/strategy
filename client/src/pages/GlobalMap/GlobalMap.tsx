import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import { ServerContext,StoreContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import GlobalMapCanvas from './GlobalMapCanvas';


import "./GlobalMap.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const Village: React.FC<IBasePage> = (props: IBasePage) => {
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
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
                <GlobalMapCanvas />
                <Button className='back-to-village-button bottom-right' onClick={VillageClickHandler} text="Назад"/>
            </div>
        </div>
    );
};

export default Village;