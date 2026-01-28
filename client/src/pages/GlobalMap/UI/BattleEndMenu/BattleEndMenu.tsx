import React from 'react';
import { UIELEMENT } from '../../../Village/UI/UI';
import { PAGES } from '../../../PageManager';
import Store from '../../../../services/store/Store';
import "./BattleEndMenu.scss"; 

interface BattleEndMenuProps {
    setUIElement: (name: UIELEMENT) => void;
    setPage: (name: PAGES) => void;
    store: Store;
    isWinner?: boolean; 
    loot?: { gold: number };
}

const BattleEndMenu: React.FC<BattleEndMenuProps> = ({ 
    setUIElement, 
    setPage, 
    isWinner = true, 
    loot = { gold: 1000 } 
}) => {
    const handleBackToVillage = () => {
        setUIElement(UIELEMENT.NULL);
        setPage(PAGES.VILLAGE);
    };

    return (
        <div className="BattleEndOverlay">
            <div className={`BattleEndMenu ${isWinner ? 'victory' : 'defeat'}`}>
                <div className="result-header">
                    <h1>{isWinner ? "ПОБЕДИТЕЛЬ" : "ПОРАЖЕНИЕ"}</h1>
                </div>
                <div className="loot-section">
                    <h3>Ваша добыча:</h3>
                    <div className="value">+{loot.gold} Золота</div>
                </div>
                <button className="to-village-btn" onClick={handleBackToVillage}>
                    В ДЕРЕВНЮ
                </button>
            </div>
        </div>
    );
};

export default BattleEndMenu;