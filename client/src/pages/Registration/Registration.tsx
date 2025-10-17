import React, { useContext, useRef, useState, useEffect } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import { validateLogin, validatePassword, checkLoginAvailability } from '../VerificationOfRegistrationAndAuthorization/ValidationUtils';
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
            setPage(PAGES.CHAT);
        }
    }
}

const backClickHandler = () => setPage(PAGES.LOGIN);

return (
    <div className='registration'>
        <h1 id='title'>STRATEGY</h1>
        <div className='registration-wrapper'>
            <div className='registration-inputs'>
                <p>Логин</p>
                <input ref={loginRef} />
                {loginError && <p className="error-message">{loginError}</p>}
                <p>Пароль</p>
                <input ref={passwordRef} type='password' />
                {passwordError && <p className="error-message">{passwordError}</p>}
                <p>Подтверждение</p>
                <input ref={confirmPasswordRef} type='password' />
                {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
                <p>Отображаемое имя</p>
                <input ref={nameRef} />
                {nameError && <p className="error-message">{nameError}</p>}
            </div>
            <div className='registration-buttons'>
                <Button onClick={registerClickHandler} text='Зарегистрироваться' />
                <Button onClick={backClickHandler} text='Назад' />
            </div>
        </div>
    </div>
)
}

export default Registration;