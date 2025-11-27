import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import { ServerContext,StoreContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import VillageCanvas from './VillageCanvas';
import UI from './UI/UI';



import "./Village.scss"

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
            <h1>Менеджмент деревни</h1>
            <Button className='button-main1' onClick={BattleClickHandler} text='Battle' />
            <Button className='button-main1' onClick={CalculatorClickHandler} text='Calculator' />
            <Button className='button-main1' onClick={GlobalMapClickHandler} text='GlobalMap' />
            <Button className='button-main1' onClick={VillageClickHandler} text='Village' />
            <Button className='button-main1' onClick={backClickHandler} text='Выход' />
            <Button className='button-main1' onClick={chatClickHandler} text='Чат' />
            <div>
                <VillageCanvas />
            </div>
            <UI store={store} />
        </div>
    );
};

export default Village;