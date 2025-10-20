



import React, { useContext, useEffect, useRef, useState } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import { validateLogin, validatePassword } from '../Verification/Verification';
import './Login.scss';

import arrow from '../../assets/img/sprites/arrow.png';
import swordman from '../../assets/img/sprites/swordman.png';
import archer from '../../assets/img/sprites/archer.png';
import spearman from '../../assets/img/sprites/spearman.png';

const Login: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const loginRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [loginError, setLoginError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const loginClickHandler = async () => {
        if (loginRef.current && passwordRef.current) {
            const login = loginRef.current.value;
            const password = passwordRef.current.value;

            // Сбрасываем предыдущие ошибки
            setLoginError('');
            setPasswordError('');

            let hasErrors = false;

            // Проверка логина
            const loginValidation = validateLogin(login);
            if (!loginValidation.isValid) {
                setLoginError(loginValidation.message);
                hasErrors = true;
            }

            // Проверка пароля
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                setPasswordError(passwordValidation.message);
                hasErrors = true;
            }

            // Если есть ошибки - не отправляем на сервер
            if (hasErrors) {
                return;
            }

            // Сохранение логина и пароля в cookies если отмечено "Запомнить меня"
            if (rememberMe) {
                setCookie('rememberedLogin', login, 30);
                setCookie('rememberedPassword', password, 30);
            } else {
                deleteCookie('rememberedLogin');
                deleteCookie('rememberedPassword');
            }

            // Отправка данных на сервер
            if (login && password && await server.login(login, password)) {
                setPage(PAGES.CHAT);
            }
        }
    }

    useEffect(() => {
        const savedLogin = getCookie('rememberedLogin');
        const savedPassword = getCookie('rememberedPassword');
        
        if (loginRef.current && savedLogin) {
            loginRef.current.value = savedLogin;
            setRememberMe(true);
        }
        if (passwordRef.current && savedPassword) {
            passwordRef.current.value = savedPassword;
        }
    }, []);

    const setCookie = (name: string, value: string, days: number) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
    }

    const getCookie = (name: string): string | null => {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r
        }, '') || null;
    }

    const deleteCookie = (name: string) => {
        setCookie(name, '', -1);
    }

    const regClickHandler = () => setPage(PAGES.REGISTRATION);

    return (
        <div className='login'>
            <img src={arrow} className="arrow arrow-left" />
            <img src={arrow} className="arrow arrow-right" />

            <img src={swordman} className="swordman swordman-left" />
            <img src={archer} className="archer archer-left" />
            <img src={spearman} className="spearman spearman-left" />

            <img src={swordman} className="swordman swordman-right" />
            <img src={archer} className="archer archer-right" />
            <img src={spearman} className="spearman spearman-right" />

            <div className='login-content'>
                <h1 className='version'>Alpha</h1>
                <h1 className="title">STRATEGY</h1>
                <div className="login-form">
                    <label>Логин</label>
                    <input ref={loginRef} id="Test-input-login" />
                    {loginError && <p className="error-message">{loginError}</p>}
                    
                    <label>Пароль</label>
                    <input ref={passwordRef} type='password' id="Test-input-password" />
                    {passwordError && <p className="error-message">{passwordError}</p>}
                    
                    <div className="remember-me">
                        <input 
                            type="checkbox" 
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="rememberMe">Запомнить меня</label>
                    </div>

                    <Button onClick={loginClickHandler} text='Авторизоваться' id="Test-button-autorization" />
                    <Button onClick={regClickHandler} text='Регистрация' id="Test-button-back" />
                </div>
            </div>
        </div>
    )
}

export default Login;