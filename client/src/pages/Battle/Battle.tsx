import React, { useState } from 'react';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import BattleCanvas from './BattleCanvas';
import BattleEndMenu from '../GlobalMap/UI/BattleEndMenu/BattleEndMenu';

const Battle: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage, store } = props;

    const [showEndMenu, setShowEndMenu] = useState(true);

    const backclickHandler = () => setPage(PAGES.VILLAGE);

    const handleBackToVillage = () => {
        setShowEndMenu(false);
        setPage(PAGES.VILLAGE);
    };

    return (
        <div className="BattlePageContainer" style={{ width: '100vw', height: '100vh', position: 'relative', zIndex: 1}}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'auto', zIndex: 10 }}>
                <h1 style={{ color: 'white', textShadow: '2px 2px 4px black' }}>Battle</h1>
                <Button onClick={backclickHandler} text='Назад'/>
            </div>
            <BattleCanvas />
            {showEndMenu && (
                <BattleEndMenu 
                    setUIElement={() => setShowEndMenu(false)}
                    setPage={setPage} 
                    store={store} 
                    isWinner={true}
                    loot={{ gold: 1000 }}
                />
            )}
        </div>
    );
};

export default Battle;