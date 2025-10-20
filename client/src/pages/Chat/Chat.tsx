import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { ServerContext, StoreContext } from '../../App';
import { TMessages } from '../../services/server/types';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import './Chat.scss';

const Chat: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const [messages, setMessages] = useState<TMessages>([]);
    const [_, setHash] = useState<string>('');
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const messageRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const previousMessagesLengthRef = useRef(0);
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
    });

    // Проверяем, находится ли пользователь внизу чата
    const isUserAtBottom = () => {
        if (!messagesContainerRef.current) return true;
        
        const container = messagesContainerRef.current;
        const threshold = 100; // пикселей от низа, чтобы считать что пользователь внизу
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    };

    // Обработчик прокрутки
    const handleScroll = () => {
        if (isUserAtBottom()) {
            setShouldAutoScroll(true);
        } else {
            setShouldAutoScroll(false);
        }
    };

    // Автоматическая прокрутка вниз при новых сообщениях
    useEffect(() => {
        // Прокручиваем только если есть новые сообщения и разрешено автоскроллить
        if (shouldAutoScroll && messages.length > previousMessagesLengthRef.current) {
            const frame = requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            });
            previousMessagesLengthRef.current = messages.length;
            return () => cancelAnimationFrame(frame);
        }
    }, [messages, shouldAutoScroll]);

    const input = useMemo(() => <input ref={messageRef} placeholder='сообщение' />, []);

    const sendClickHandler = () => {
        if (messageRef.current) {
            const message = messageRef.current.value;
            if (message) {
                server.sendMessage(message);
                messageRef.current.value = '';
                setShouldAutoScroll(true);
            }
        }
    }

    const toGameClickHandler = () => setPage(PAGES.VILLAGE);
    const backClickHandler = () => setPage(PAGES.LOGIN);

    if (!user) {
        return (
            <div className="chat">
                <div className="chat-content">
                    <h1 className="title">Чат</h1>
                    <h2>Что-то пошло не так =(</h2>
                    <div className="chat-form">
                        <Button onClick={toGameClickHandler} text='В игру!' />
                        <Button onClick={backClickHandler} text='Назад' />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="chat">
            <div className="chat-content">
                <h1 className="title">Чат</h1>
                
                <div className="chat-user-info">
                    <span>Привет, {user.name}!</span>
                </div>

                <div 
                    className="chat-messages" 
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                >
                    {messages.map((message, index) => 
                        <div key={index} className="message">
                            <span className="message-author">{message.author}</span>
                            <span className="message-time">({message.created})</span>
                            <span className="message-text">: {message.message}</span>
                        </div>
                    )}
                    {/* Невидимый элемент для автоматической прокрутки */}
                    <div ref={messagesEndRef} className="scroll-anchor" />
                </div>

                <div className="chat-form">
                    <input 
                        ref={messageRef} 
                        placeholder='сообщение' 
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                sendClickHandler();
                            }
                        }}
                    />
                    <div className="chat-buttons">
                        <Button onClick={sendClickHandler} text='Отправить' />
                        <Button onClick={toGameClickHandler} text='В игру!' />
                        <Button onClick={backClickHandler} text='Назад' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat;