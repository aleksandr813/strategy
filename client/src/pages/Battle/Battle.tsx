import React, { useState, useEffect, useContext } from 'react';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import BattleCanvas from './BattleCanvas';
import BattleEndMenu from '../GlobalMap/UI/BattleEndMenu/BattleEndMenu';
import { GameContext } from '../../App';

const Battle: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage, store } = props;
    const game = useContext(GameContext);
    const [showEndMenu, setShowEndMenu] = useState(false);
    const [battleResult, setBattleResult] = useState<{isWinner: boolean, loot: {gold: number}} | null>(null);

    useEffect(() => {
        if (!game) return;

        const handleBattleEnd = (data: {isWinner: boolean, loot: {gold: number}}) => {
            setBattleResult(data);
            setShowEndMenu(true);
        };

        game.mediator.subscribe('BATTLE_END', handleBattleEnd);
        
        return () => {
            game.mediator.unsubscribe('BATTLE_END', handleBattleEnd);
        };
    }, [game]);

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
            {showEndMenu && battleResult && (
                <BattleEndMenu 
                    setUIElement={() => setShowEndMenu(false)}
                    setPage={setPage} 
                    store={store} 
                    isWinner={battleResult.isWinner}
                    loot={battleResult.loot}
                />
            )}
        </div>
    );
};

export default Battle;