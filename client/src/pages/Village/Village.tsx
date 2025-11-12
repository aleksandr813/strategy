import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import VillageCanvas from './VillageCanvas';
import UI from './UI/UI';
import { ServerContext,StoreContext,GameContext } from '../../App';


import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const Village: React.FC<IBasePage> = (props: IBasePage) => {
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const game = useContext(GameContext);
    const token = store.getToken();
    
    const { setPage } = props;

    const [money, setMoney] = useState<number>(0);

    useEffect(() => {
        console.log('Village: useEffect called');
        
        const handleMoneyUpdate = (newMoney: number) => {
            console.log('Village: money update to', newMoney);
            setMoney(newMoney);
        };

        game.onMoneyUpdate(handleMoneyUpdate);

        const initialMoney = game.getMoney();
        console.log('Village: initial money from game:', initialMoney);
        setMoney(initialMoney);

        const forceUpdateInterval = setInterval(() => {
            const currentMoney = game.getMoney();
            console.log('Village: getting money from game:', currentMoney);
            setMoney(currentMoney);
        }, 10000);

        return () => {
            console.log('Village: cleanup function called');
            clearInterval(forceUpdateInterval);
            game.removeMoneyListener(handleMoneyUpdate);
        };
    }, [game]);
    
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
            <UI money={money}/>
        </div>
    );
};

export default Village;