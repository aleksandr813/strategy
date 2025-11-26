import React, { useContext, useEffect, useState, useMemo, useRef, KeyboardEvent } from 'react';
import { TMessages } from '../../services/server/types';
import { ServerContext, StoreContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

import chatIcon from '../../assets/img/chat/back.png';
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
        />, 
    [handleKeyUp]);

    const toGameClickHandler = () => setPage(PAGES.VILLAGE);
    const backClickHandler = () => setPage(PAGES.LOGIN);

    if (!user) {
        return (<div className='chat'>
            <h1>Чат</h1>
            <h1>Что-то пошло не так =(</h1>
            <Button onClick={toGameClickHandler} text='В игру!' />
            <Button onClick={backClickHandler} text='Назад' />
        </div>)
    }

    return (<div className='chat'>
        <h1>Чат</h1>
        <div className='chat-user-info'>
            <span>Привет!</span>
            <span>{user.name}</span>
        </div>
        <div className='chat-messages'>
            {messages.reverse().map((message, index) => 
                <div key={index}>{`${message.author} (${message.created}): ${message.message}`}</div>
            )}
        </div>
        <div className='chat-buttons'>
            {input}
            <Button onClick={toGameClickHandler} className='chatIconeDiv'>
                <img src={chatIcon} className='chatIcone'/>
            </Button>
        </div>
    </div>)
}

export default Chat;