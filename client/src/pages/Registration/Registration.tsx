import React, { useContext, useRef, useState,useEffect } from 'react';
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

  // Валидация логина в реальном времени
useEffect(() => {
    const validateLoginRealTime = async () => {
        if (loginRef.current) {
            const login = loginRef.current.value;
            if (login.length > 0) {
                const validation = validateLogin(login);
                if (!validation.isValid) {
                    setLoginError(validation.message);
                    return;
                }
                
                // Проверка доступности логина
                const availability = await checkLoginAvailability(login);
                if (!availability.isValid) {
                    setLoginError(availability.message);
                    return;
                }
                
                setLoginError('');
            } else {
                setLoginError('');
            }
        }
    };

    const timer = setTimeout(validateLoginRealTime, 500);
    return () => clearTimeout(timer);
}, [loginRef.current?.value]);

// Валидация пароля в реальном времени
useEffect(() => {
    if (passwordRef.current && loginRef.current && nameRef.current) {
        const password = passwordRef.current.value;
        const login = loginRef.current.value;
        const name = nameRef.current.value;
        
        if (password.length > 0) {
            const validation = validatePassword(password, login, name);
            if (!validation.isValid) {
                setPasswordError(validation.message);
            } else {
                setPasswordError('');
            }
        } else {
            setPasswordError('');
        }
    }
}, [passwordRef.current?.value, loginRef.current?.value, nameRef.current?.value]);

// Валидация подтверждения пароля в реальном времени
useEffect(() => {
    if (passwordRef.current && confirmPasswordRef.current) {
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;
        
        if (confirmPassword.length > 0 && password !== confirmPassword) {
            setConfirmPasswordError('Пароли не совпадают');
        } else {
            setConfirmPasswordError('');
        }
    }
}, [passwordRef.current?.value, confirmPasswordRef.current?.value]);

// Валидация имени в реальном времени
useEffect(() => {
    if (nameRef.current) {
        const name = nameRef.current.value;
        if (name.length === 0) {
            setNameError('Имя не может быть пустым');
        } else if (name.length > 50) {
            setNameError('Имя слишком длинное');
        } else {
            setNameError('');
        }
    }
}, [nameRef.current?.value]);

const registerClickHandler = async () => {
    if (loginRef.current && passwordRef.current && confirmPasswordRef.current && nameRef.current) {
        const login = loginRef.current.value;
        const password = passwordRef.current.value;
        const confirmPassword = confirmPasswordRef.current.value;
        const name = nameRef.current.value;
        
        // Финальная проверка перед отправкой
        const loginValidation = validateLogin(login);
        const passwordValidation = validatePassword(password, login, name);
        const availability = await checkLoginAvailability(login);
        
        if (!loginValidation.isValid) {
            setLoginError(loginValidation.message);
            return;
        }
        
        if (!availability.isValid) {
            setLoginError(availability.message);
            return;
        }
        
        if (!passwordValidation.isValid) {
            setPasswordError(passwordValidation.message);
            return;
        }
        
        if (password !== confirmPassword) {
            setConfirmPasswordError('Пароли не совпадают');
            return;
        }
        
        if (name.length === 0) {
            setNameError('Имя не может быть пустым');
            return;
        }
        
        // Сбрасываем ошибки если все валидно
        setLoginError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setNameError('');
        
        if (login && password && name && await server.registration(login, password, name)) {
            setPage(PAGES.CHAT);
        }
    }
}

const backClickHandler = () => setPage(PAGES.LOGIN);

return (<div className='registration'>
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
</div>)
}

export default Registration;