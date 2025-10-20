import React, { useContext, useState, useEffect } from 'react';
import { ServerContext } from '../../App';
import './Popup.scss';
import { TError } from '../../services/server/types';

type TInnerButton = {
    isHover?: boolean;
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

export type TPopupData = {
    className?: string;
    title?: string;
    text?: string;
    closeHovered?: boolean;
    buttons?: TInnerButton[];
};

const Popup: React.FC = () => {
    const server = useContext(ServerContext);
    const [data, setData] = useState<TPopupData | null>(null);

    useEffect(() => {
        const showErrorHandler = (error: TError) => {
            const { code, text } = error;
            setData({
                title: `Ошибка №${code}`,
                text,
            });
            setTimeout(() => setData(null), 3000);
        }
    
        server.showError(showErrorHandler);
    });

    if (!data) return null;

    const { title, text, buttons = [] } = data;

    return (
        <div className="popup">
            <div className='popup-wrapper'>
                <div className='popup-text-block'>
                    {title && <div className="popup-title">{title}</div>}
                    {text && <div className="popup--info-text">{text}</div>}
                </div>
                {buttons.length > 0 && (
                    <div className='buttons-block'>
                        {buttons.map((button, index) => (
                            <button
                                key={index}
                                className={button.variant === 'secondary' ? 'secondary' : ''}
                                onClick={button.onClick}
                            >
                                {button.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Popup;