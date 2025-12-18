import React, { useContext, useRef, useState, useEffect } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import { validateLogin, validatePassword, checkLoginAvailability } from '../../services/verification/Verification';
import './Registration.scss';

const Registration: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const loginRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [nameError, setNameError] = useState('');

    const registerClickHandler = async () => {
        if (loginRef.current && passwordRef.current && confirmPasswordRef.current && nameRef.current) {
            const login = loginRef.current.value;
            const password = passwordRef.current.value;
            const confirmPassword = confirmPasswordRef.current.value;
            const name = nameRef.current.value;

            // Сбрасываем предыдущие ошибки
            setLoginError('');
            setPasswordError('');
            setConfirmPasswordError('');
            setNameError('');

            let hasErrors = false;

            // Проверка логина
            const loginValidation = validateLogin(login);
            if (!loginValidation.isValid) {
                setLoginError(loginValidation.message);
                hasErrors = true;
            } else {
                const availability = await checkLoginAvailability(login);
                if (!availability.isValid) {
                    setLoginError(availability.message);
                    hasErrors = true;
                }
            }

            // Проверка пароля
            const passwordValidation = validatePassword(password, login, name);
            if (!passwordValidation.isValid) {
                setPasswordError(passwordValidation.message);
                hasErrors = true;
            }

            // Проверка подтверждения пароля
            if (password !== confirmPassword) {
                setConfirmPasswordError('Пароли не совпадают');
                hasErrors = true;
            }

            // Проверка имени
            if (name.length === 0) {
                setNameError('Имя не может быть пустым');
                hasErrors = true;
            } else if (name.length > 50) {
                setNameError('Имя слишком длинное');
                hasErrors = true;
            }

            // Если есть ошибки - не отправляем на сервер
            if (hasErrors) {
                return;
            }

            // Отправка данных на сервер
            if (login && password && name && await server.registration(login, password, name)) {
                setPage(PAGES.VILLAGE);
            }
        }
    };

    const backClickHandler = () => setPage(PAGES.LOGIN);

    return (
        <div className="registration">
            <div className="background-characters left"></div>
            <div className="background-characters right"></div>
        
            <div className="registration-content">
                <h1 className="title">STRATEGY</h1>

                <div className="registration-form">
                    <label>Логин</label>
                    <input ref={loginRef} id="Test-input-login" />
                    {loginError && <p className="error-message">{loginError}</p>}

                    <label>Пароль</label>
                    <input ref={passwordRef} type="password" id="Test-input-password" />
                    {passwordError && <p className="error-message">{passwordError}</p>}

                    <label>Подтверждение пароля</label>
                    <input ref={confirmPasswordRef} type="password" id="Test-input-password-2" />
                    {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}

                    <label>Отображаемое имя</label>
                    <input ref={nameRef} id="Test-input-name" />
                    {nameError && <p className="error-message">{nameError}</p>}

                    <Button onClick={registerClickHandler} text="Зарегистрироваться" id="Test-button-registration" />
                    <Button onClick={backClickHandler} text="Назад" id="Test-button-back" />
                </div>
            </div>
        </div>
    );
};

export default Registration;