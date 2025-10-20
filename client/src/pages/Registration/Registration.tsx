import React, { useContext, useRef, useState, useEffect } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import { validateLogin, validatePassword, checkLoginAvailability } from '../Verification/Verification';
import './Registration.scss';

import arrow from '../../assets/img/sprites/arrow.png';
import swordman from '../../assets/img/sprites/swordman.png';
import archer from '../../assets/img/sprites/archer.png';
import spearman from '../../assets/img/sprites/spearman.png';

const Registration: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const loginRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorCode, setErrorCode] = useState('');

    const registerClickHandler = async () => {
        if (loginRef.current && passwordRef.current && confirmPasswordRef.current && nameRef.current) {
            const login = loginRef.current.value;
            const password = passwordRef.current.value;
            const confirmPassword = confirmPasswordRef.current.value;
            const name = nameRef.current.value;

            // Сбрасываем предыдущие ошибки
            setShowError(false);

            let hasErrors = false;

            // Проверка логина
            const loginValidation = validateLogin(login);
            if (!loginValidation.isValid) {
                setErrorMessage(loginValidation.message);
                setErrorCode('1001');
                setShowError(true);
                hasErrors = true;
            } else {
                const availability = await checkLoginAvailability(login);
                if (!availability.isValid) {
                    setErrorMessage(availability.message);
                    setErrorCode('1003');
                    setShowError(true);
                    hasErrors = true;
                }
            }

            // Проверка пароля
            const passwordValidation = validatePassword(password, login, name);
            if (!passwordValidation.isValid) {
                setErrorMessage(passwordValidation.message);
                setErrorCode('1002');
                setShowError(true);
                hasErrors = true;
            }

            // Проверка подтверждения пароля
            if (password !== confirmPassword) {
                setErrorMessage('Пароли не совпадают');
                setErrorCode('1004');
                setShowError(true);
                hasErrors = true;
            }

            // Проверка имени
            if (name.length === 0) {
                setErrorMessage('Имя не может быть пустым');
                setErrorCode('1006');
                setShowError(true);
                hasErrors = true;
            } else if (name.length > 50) {
                setErrorMessage('Имя слишком длинное');
                setErrorCode('1007');
                setShowError(true);
                hasErrors = true;
            }

            // Если есть ошибки - не отправляем на сервер
            if (hasErrors) {
                return;
            }

            // Отправка данных на сервер
            if (login && password && name && await server.registration(login, password, name)) {
                setPage(PAGES.CHAT);
            } else {
                setErrorMessage('Ошибка регистрации');
                setErrorCode('1008');
                setShowError(true);
            }
        }
    };

    const backClickHandler = () => setPage(PAGES.LOGIN);

    return (
        <div className="registration">
            {/* Уведомление об ошибке */}
            {showError && (
                <div className="error-notification">
                    {errorCode && <div className="error-code">ОШИБКА №{errorCode}</div>}
                    <div className="error-message">{errorMessage}</div>
                </div>
            )}

            <div className="background-characters left"></div>
            <div className="background-characters right"></div>

            <img src={arrow} className="arrow arrow-left" />
            <img src={arrow} className="arrow arrow-right" />

            <img src={swordman} className="swordman swordman-left" />
            <img src={archer} className="archer archer-left" />
            <img src={spearman} className="spearman spearman-left" />

            <img src={swordman} className="swordman swordman-right" />
            <img src={archer} className="archer archer-right" />
            <img src={spearman} className="spearman spearman-right" />
        
            <div className="registration-content">
                <h1 className='version'>Alpha</h1>
                <h1 className="title">STRATEGY</h1>

                <div className="registration-form">
                    <label>Логин</label>
                    <input ref={loginRef} id="Test-input-login" />

                    <label>Пароль</label>
                    <input ref={passwordRef} type="password" id="Test-input-password" />

                    <label>Подтверждение пароля</label>
                    <input ref={confirmPasswordRef} type="password" id="Test-input-password-2" />

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