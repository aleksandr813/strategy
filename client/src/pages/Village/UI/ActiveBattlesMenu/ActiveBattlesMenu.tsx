import React, { useContext, useEffect, useState } from 'react';
import { UIELEMENT } from '../UI';
import Store from '../../../../services/store/Store';
import { TActiveBattle } from '../../../../services/server/types';
import { GameContext } from '../../../../App';
import { PAGES } from '../../../PageManager';

import "./ActiveBattlesMenu.scss";
import Mediator from '../../../../services/mediator/Mediator';

interface ActiveBattlesMenuProps {
    setUIElement: (name: UIELEMENT) => void;
    store: Store;
    setPage: (name: PAGES) => void;
    mediator: Mediator
}

const ActiveBattlesMenu: React.FC<ActiveBattlesMenuProps> = ({ setUIElement, store, setPage }) => {
    const game = useContext(GameContext);

    const [battles, setBattles] = useState<TActiveBattle | null>(game.getActiveBattles());

    useEffect(() => {
        const handleUpdate = () => {
            setBattles(game.getActiveBattles());
        };

        store.mediator.subscribe('UPDATE_BATTLES', handleUpdate);
        handleUpdate();

        return () => {
            store.mediator.unsubscribe('UPDATE_BATTLES', handleUpdate);
        };
    }, [game, store.mediator]);

    const closeMenu = () => setUIElement(UIELEMENT.NULL);

    return (
        <div className="ActiveBattlesOverlay" onClick={closeMenu}>
            <div className="ActiveBattlesMenu" onClick={(e) => e.stopPropagation()}>
                <div className="menu-header">
                    <span>АКТИВНЫЕ БОИ</span>
                </div>

                <div className="battles-list">
                    {battles?.attack?.length ? (
                        battles.attack.map(item => (
                            <div key={item.id} className="battle-item attack">
                                <span>Атака ID: {item.id}</span>
                                <button
                                    className="go-btn"
                                    onClick={() => {
                                        game.setCurrentBattle(Number(item.id));
                                        setUIElement(UIELEMENT.NULL);
                                        setPage(PAGES.BATTLE);
                                    }}
                                >
                                    ПЕРЕЙТИ
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-msg">НЕТ АКТИВНЫХ СРАЖЕНИЙ</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveBattlesMenu;