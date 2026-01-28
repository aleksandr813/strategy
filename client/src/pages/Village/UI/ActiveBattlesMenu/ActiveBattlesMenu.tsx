import React, { useContext, useEffect, useState } from 'react';
import { UIELEMENT } from '../UI';
import Store from '../../../../services/store/Store';
import { TActiveBattle } from '../../../../services/server/types';
import { GameContext } from '../../../../App';
import { PAGES } from '../../../PageManager';
import Mediator from '../../../../services/mediator/Mediator';

import "./ActiveBattlesMenu.scss";

interface ActiveBattlesMenuProps {
    setUIElement: (name: UIELEMENT) => void;
    store: Store;
    setPage: (name: PAGES) => void;
    mediator: Mediator;
}

const ActiveBattlesMenu: React.FC<ActiveBattlesMenuProps> = ({ setUIElement, store, setPage }) => {
    const game = useContext(GameContext);

    const [battles, setBattles] = useState<TActiveBattle | null>(game.getActiveBattles());

    useEffect(() => {
        const handleUpdate = () => {
            const activeBattles = game.getActiveBattles();
            console.log("Обновление списка боев:", activeBattles);
            setBattles(activeBattles);
        };

        store.mediator.subscribe('UPDATE_BATTLES', handleUpdate);
        
        handleUpdate();

        return () => {
            store.mediator.unsubscribe('UPDATE_BATTLES', handleUpdate);
        };
    }, [game, store.mediator]);

    const closeMenu = () => setUIElement(UIELEMENT.NULL);

    const joinBattle = (id: number) => {
        game.setCurrentBattle(id);
        setUIElement(UIELEMENT.NULL);
        setPage(PAGES.BATTLE);
    };

    const hasAttack = battles?.attack && battles.attack.length > 0;
    const hasDefend = !!battles?.defend;

    return (
        <div className="ActiveBattlesOverlay" onClick={closeMenu}>
            <div className="ActiveBattlesMenu" onClick={(e) => e.stopPropagation()}>
                <div className="menu-header">
                    <span>АКТИВНЫЕ БОИ</span>
                </div>

                <div className="battles-list">
                    {hasAttack && battles!.attack.map((item) => (
                        <div key={`attack-${item.battleId}`} className="battle-item attack">
                            <div className="battle-info">
                                <span className="label">Ваш бой</span>
                                <span className="id">ID: {item.battleId}</span>
                            </div>
                            <button
                                className="go-btn"
                                onClick={() => joinBattle(Number(item.battleId))}
                            >
                                В бой!
                            </button>
                        </div>
                    ))}
                    {/*{hasDefend && (
                        <div key={`defend-${battles!.defend!.attack_id}`} className="battle-item defend">
                            <div className="battle-info">
                                <span className="label">ОБОРОНА</span>
                                <span className="id">ID: {battles!.defend!.attack_id}</span>
                            </div>
                            <button
                                className="go-btn danger"
                                onClick={() => joinBattle(Number(battles!.defend!.attack_id))}
                            >
                                Защититься!
                            </button>
                        </div>
                    )} */}

                    {!hasAttack && !hasDefend && (
                        <div className="empty-msg">
                            Мирное небо над головой!
                        </div>
                    )}
                </div>

                <div className="menu-footer">
                    <button className="close-btn" onClick={closeMenu}>Закрыть</button>
                </div>
            </div>
        </div>
    );
};

export default ActiveBattlesMenu;