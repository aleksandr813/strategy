import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import CONFIG from '../../config';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import Game from '../../game/Game';
import useSprites from './hooks/useSprites';

import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const Village: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;

    const backClickHandler = () => setPage(PAGES.CHAT);
    const BattleClickHandler = () => setPage(PAGES.BATTLE);
    const CalculatorClickHandler = () => setPage(PAGES.CALCULATOR);
    const GlobalMapClickHandler = () => setPage(PAGES.GLOBAL_MAP);
    const VillageClickHandler = () => setPage(PAGES.VILLAGE);

    return (
    <div className='game'>
        <h1>Менеджмент деревни</h1>
        <Button onClick={BattleClickHandler} text='Battle'/>
        <Button onClick={CalculatorClickHandler} text='Calculator'/>
        <Button onClick={GlobalMapClickHandler} text='GlobalMap'/>
        <Button onClick={VillageClickHandler} text='Village'/>
        <Button onClick={backClickHandler} text='Назад' />
        <div id={GAME_FIELD} className={GAME_FIELD}></div>
    </div>
    );
};

export default Village;