import React, { useContext, useRef, useState } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

import './Registration.scss';

const Registration: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
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
            
            // Проверка совпадения паролей
            if (password !== confirmPassword) {
                setPasswordError('Пароли не совпадают');
                return;
            }
            
            setPasswordError(''); // Сбрасываем ошибку если пароли совпадают
            
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
                <input ref={loginRef} id="Test-input-login"/>
                <p>Пароль</p>
                <input ref={passwordRef} type='password' id="Test-input-password"/>
                <p>Подтверждение</p>
                <input ref={confirmPasswordRef} type='password' id="Test-input-password-2"/>
                {passwordError && <p style={{color: 'red', fontSize: 'smaller'}}>{passwordError}</p>}
                <p>Отображаемое имя</p>
                <input ref={nameRef} id="Test-input-name"/>
            </div>
            <div className='registration-buttons'>
                <Button onClick={registerClickHandler} text='Зарегистрироваться' id="Test-button-registration"/>
                <Button onClick={backClickHandler} text='Назад' id="Test-button-back"/>
            </div>
        </div>
    </div>)
}

export default Registration;