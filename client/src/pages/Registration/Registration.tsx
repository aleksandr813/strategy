import React, { useContext, useRef, useState } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import './Registration.scss';

import arrow from '../../assets/img/sprites/arrow.png';

import swordman from '../../assets/img/sprites/swordman.png';
import archer from '../../assets/img/sprites/archer.png';
import spearman from '../../assets/img/sprites/spearman.png';

const Registration: React.FC<IBasePage> = ({ setPage }) => {
const server = useContext(ServerContext);
const loginRef = useRef<HTMLInputElement>(null);
const passwordRef = useRef<HTMLInputElement>(null);
const confirmPasswordRef = useRef<HTMLInputElement>(null);
const nameRef = useRef<HTMLInputElement>(null);
const [passwordError, setPasswordError] = useState('');


const registerClickHandler = async () => {
    if (loginRef.current && passwordRef.current && confirmPasswordRef.current && nameRef.current) {
        const login = loginRef.current.value;
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;
        const name = nameRef.current.value;

        if (password !== confirmPassword) {
            setPasswordError('Пароли не совпадают');
            return;
        }

        setPasswordError('');

        if (login && password && name && await server.registration(login, password, name)) {
            setPage(PAGES.CHAT);
        }
    }
};

const backClickHandler = () => setPage(PAGES.LOGIN);

return (
    <div className="registration">
        <div className="background-characters left"></div>
        <div className="background-characters right"></div>
        <h1 className='version'>Alpha</h1>

        <img src={arrow} className="arrow arrow-left" />
        <img src={arrow} className="arrow arrow-right" />

        <img src={swordman} className="swordman swordman-left" />
        <img src={archer} className="archer archer-left" />
        <img src={spearman} className="spearman spearman-left" />

        <img src={swordman} className="swordman swordman-right" />
        <img src={archer} className="archer archer-right" />
        <img src={spearman} className="spearman spearman-right" />
    

        <div className="registration-content">
            <h1 className="title">STRATEGY</h1>

            <div className="registration-form">
                <label>Логин</label>
                <input ref={loginRef} id="Test-input-login" />

                <label>Пароль</label>
                <input ref={passwordRef} type="password" id="Test-input-password" />

                <label>Подтверждение пароля</label>
                <input ref={confirmPasswordRef} type="password" id="Test-input-password-2" />
                {passwordError && <p className="error">{passwordError}</p>}

                <label>Отображаемое имя</label>
                <input ref={nameRef} id="Test-input-name" />

                <Button onClick={registerClickHandler} text="Зарегистрироваться" id="Test-button-registration" />
                <Button onClick={backClickHandler} text="Назад" id="Test-button-back" />
            </div>
        </div>
    </div>
);


};

export default Registration;
