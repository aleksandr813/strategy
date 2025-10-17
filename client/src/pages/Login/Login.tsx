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

        // Отправка данных на сервер
        //if (1) { // тестовое условие, чтобы логин всегда был успешный и работал без бекенда
        if (login && password && await server.login(login, password)) {
            setPage(PAGES.CHAT);
        }
    }
}

const regClickHandler = () => setPage(PAGES.REGISTRATION);

return (
    <div className='login'>
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
    </div>
)

export default Login;