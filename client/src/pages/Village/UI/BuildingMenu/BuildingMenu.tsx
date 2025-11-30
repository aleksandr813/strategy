import React, { useContext, useEffect, useState } from 'react';
import GAMECONFIG from '../../../../game/gameConfig';
import { GameContext, ServerContext} from '../../../../App';
import Building from '../../../../game/entities/Building';

import "./BuildingMenu.css";

const BuildingMenu: React.FC = () => {
    const game = useContext(GameContext);
    const server = useContext(ServerContext);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        let raf: number;
        const update = () => {
            setSelectedBuilding(game.village.selectedBuilding);
            raf = requestAnimationFrame(update);
        };
        raf = requestAnimationFrame(update);
        return () => cancelAnimationFrame(raf);
    }, [game.village]);

    if (!selectedBuilding) return null;

    const openConfirm = () => setShowConfirm(true);
    const closeConfirm = () => setShowConfirm(false);

    const deleteConfirm = async () => {
        if (!selectedBuilding)return;
        
        game.village.removeBuilding(selectedBuilding);
        game.village.selectBuilding(null);
    };

    const upgrade = async () => {
        if (!selectedBuilding)return;
        const success = await server.upgradeBuilding(
        selectedBuilding.id,
        selectedBuilding.typeId
        );

        if (success) {
            await game.village.loadBuildings();
            const updated = game.village
                .getScene()
                .buildings.find(b => b.id === selectedBuilding.id);

            if (updated) {
                game.village.selectBuilding(updated);
                setSelectedBuilding(updated);
            }
            console.log("Здание успешно улучшено");
        } else {
            console.log("Не удалось улучшить здание");
        }
    };

    const canDeleteBuilding = !GAMECONFIG.EXCLUDED_BUILDINGS.includes(selectedBuilding.type);

    return (
        <div className="BuildingMenu">
            <div 
                className="menu-overlay" 
                onClick={() => game.village.selectBuilding(null)}
            >
                <div 
                    className="menu-container"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="menu-header">
                        <div className="name-lvl">
                            {selectedBuilding.type} (lvl {selectedBuilding.level})
                        </div>
                        <div className="hp-status">
                            HP: {selectedBuilding.hp}/{selectedBuilding.maxHp}
                        </div>
                    </div>
                    <div className="menu-footer">
                        <button className="levelup-button" onClick={upgrade}>Улучшить</button>
                        {canDeleteBuilding && (
                            <button className="delete-button"
                            onClick={openConfirm}
                            >Удалить</button>
                        )}
                    </div>
                </div>
            </div>
        {showConfirm && (
            <div className="confirm-overlay" onClick={closeConfirm}>
                <div className="confirm-container" onClick={e => e.stopPropagation()}>
                    <p>
                        Вы точно хотите удалить <strong>
                            {selectedBuilding.type} (lvl {selectedBuilding.level})
                        </strong>?
                    </p>
                    <div className="confirm-buttons">
                        <button className='confirm-yes' onClick={deleteConfirm}>
                        ДА
                        </button>
                        <button className='confirm-no' onClick={closeConfirm}>
                        НЕТ
                        </button>
                    </div>
                </div>
            </div>    
            )}
        </div>    
    );
};

export default BuildingMenu;