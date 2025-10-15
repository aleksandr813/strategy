import React, { useContext, useRef, useState, useEffect } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import { validateLogin, validatePassword } from '../VerificationOfRegistrationAndAuthorization/ValidationUtils';

import './Login.scss';

const Login: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const loginRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [loginError, setLoginError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Валидация логина в реальном времени
    useEffect(() => {
        if (loginRef.current) {
            const login = loginRef.current.value;
            if (login.length > 0) {
                const validation = validateLogin(login);
                if (!validation.isValid) {
                    setLoginError(validation.message);
                } else {
                    setLoginError('');
                }
            } else {
                setLoginError('');
            }
        }
    }, [loginRef.current?.value]);

    // Валидация пароля в реальном времени
    useEffect(() => {
        if (passwordRef.current) {
            const password = passwordRef.current.value;
            if (password.length > 0) {
                const validation = validatePassword(password);
                if (!validation.isValid) {
                    setPasswordError(validation.message);
                } else {
                    setPasswordError('');
                }
            } else {
                setPasswordError('');
            }
        }
    }, [passwordRef.current?.value]);

    const loginClickHandler = async () => {
        if (loginRef.current && passwordRef.current) {
            const login = loginRef.current.value;
            const password = passwordRef.current.value;

            // Финальная проверка перед отправкой
            const loginValidation = validateLogin(login);
            const passwordValidation = validatePassword(password);

            if (!loginValidation.isValid) {
                setLoginError(loginValidation.message);
                return;
            }

            if (!passwordValidation.isValid) {
                setPasswordError(passwordValidation.message);
                return;
            }

            // Сбрасываем ошибки если все валидно
            setLoginError('');
            setPasswordError('');

            //if (1) { // тестовое условие, чтобы логин всегда был успешный и работал без бекенда
            if (login && password && await server.login(login, password)) {
                setPage(PAGES.CHAT);
            }
        }
    }
    const regClickHandler = () => setPage(PAGES.REGISTRATION);

    return (<div className='login'>
        <h1 id='title'>STRATEGY</h1>
        <div className='login-wrapper'>
            <div className='login-inputs'>
                <p>Логин</p>
                <input ref={loginRef} />
                {loginError && <p className="error-message">{loginError}</p>}
                <p>Пароль</p>
                <input ref={passwordRef} type='password' />
                {passwordError && <p className="error-message">{passwordError}</p>}
            </div>
            <div className='login-buttons'>
                <Button onClick={loginClickHandler} text='Авторизоваться' />
                <Button onClick={regClickHandler} text='Регистрация' />
            </div>
        </div>
    </div>)
}
export default Login;