import React, { useContext, useEffect, useState, useMemo, useRef, KeyboardEvent } from 'react';
import { TMessages } from '../../services/server/types';
import { ServerContext, StoreContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

import chatIcon from '../../assets/img/chat/X.png';
import CONFIG from '../../config';
import './Chat.scss';

const Chat: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const [messages, setMessages] = useState<TMessages>([]);
    const [_, setHash] = useState<string>('');
    const messageRef = useRef<HTMLInputElement>(null);
    const user = store.getUser();

    useEffect(() => {
        const newMessages = (hash: string) => {
            const messages = store.getMessages();
            if (messages?.length) {
                setMessages(messages);
                setHash(hash);
            }
        }

        if (user) {
            server.startChatMessages(newMessages);
        }

        return () => {
            server.stopChatMessages();
        }
    }, [user, server, store]);

    const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (messageRef.current) {
                const message = messageRef.current.value;
                if (message.length > CONFIG.CHAT_MAX_MESSAGE_LENGTH) {
                        console.log(`Сообщение не должно превышать ${CONFIG.CHAT_MAX_MESSAGE_LENGTH} символов`);
                        return;
                }
                if (message) {
                    server.sendMessage(message);
                    messageRef.current.value = '';
                }
            }
        }
    }

    const input = useMemo(() => 
        <input 
            ref={messageRef} 
            onKeyUp={handleKeyUp} 
            placeholder='сообщение' 
            className='inputChat'
        />, 
    [handleKeyUp]);

    const toGameClickHandler = () => setPage(PAGES.VILLAGE);
    const backClickHandler = () => setPage(PAGES.LOGIN);

    const getAuthorColor = (author: string) => {
        let hash = 0;
        for (let i = 0; i < author.length; i++) {
            hash = author.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Генерируем цвет в формате HSL для лучшей читаемости
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    if (!user) {
        return (<div className='chat'>
            <h1>Чат</h1>
            <h1>Что-то пошло не так =(</h1>
            <Button onClick={toGameClickHandler} text='В игру!' />
            <Button onClick={backClickHandler} text='Назад' />
        </div>)
    }

    return (<div className='chat'>
        <Button onClick={toGameClickHandler} className='chatIconeDivBack'>
            <img src={chatIcon}/>
        </Button>
        <div className='chat-messages'>
            {messages.reverse().map((message, index) => 
                <div key={index} className='message-item'>
                    <span style={{ color: getAuthorColor(message.author) }}>
                        {message.author}: 
                    </span>
                    <span className='message-text'>{message.message}</span>
                </div>
            )}
        </div>
        <div className='chat-buttons'>
            {input}
        </div>
    </div>)
}

export default Chat;