import maxIcon from '../../assets/img/joke/max.webp'
import gosIcon from '../../assets/img/joke/gos.png'
import React, { useContext, useRef, useState, useEffect } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

import './Login.scss';

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
                setPage(PAGES.VILLAGE);
            }
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            loginClickHandler();
        }
    };

    const jokeClickHandler = () => {window.open('https://rutube.ru/video/f3b615db135287a64584737e664e1e4b/?r=plwd')}

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
            <div className="background-characters left"></div>
            <div className="background-characters right"></div>
            
            <div className='login-content'>
                <h1 className='version'>Alpha</h1>
                <h1 className="title">STRATEGY</h1>
                <div className="login-form">
                    <label>Логин</label>
                    <input ref={loginRef} id="Test-input-login" onKeyDown={handleKeyDown} />
                    {loginError && <p className="error-message">{loginError}</p>}
                    
                    <label>Пароль</label>
                    <input ref={passwordRef} type='password' id="Test-input-password" onKeyDown={handleKeyDown} />
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

                    <Button onClick={loginClickHandler} text='Авторизоваться' className='buttons' id="Test-button-autorization" />
                    <Button onClick={regClickHandler} text='Регистрация' className='buttons' id="Test-button-back" />
                    <Button onClick={jokeClickHandler} className='max-login-btn'>
                    <img 
                        src= { maxIcon }
                        alt="MAX"
                        className="joke-icon"
                    />
                    Вход через MAX
                    </Button>
                    <Button onClick={jokeClickHandler} className='gosuslugi-login-btn'>
                    <img 
                        src= { gosIcon }
                        alt="ГосУслуги"
                        className="joke-icon"
                    />
                    Вход через ГосУслуги
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Login;