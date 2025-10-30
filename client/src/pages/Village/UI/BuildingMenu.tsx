import React, { useContext, useEffect, useState } from 'react';
import { VillageContext, ServerContext } from '../../../App';
import Building from '../../../game/Buildings/Building';
import "./BuildingMenu.css";
import Server from '../../../services/server/Server';

const BuildingMenu: React.FC = () => {
    const village = useContext(VillageContext);
    const server = useContext(ServerContext);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        let raf: number;
        const update = () => {
            setSelectedBuilding(village.selectedBuilding);
            raf = requestAnimationFrame(update);
        };
        raf = requestAnimationFrame(update);
        return () => cancelAnimationFrame(raf);
    }, [village]);

    if (!selectedBuilding) return null;

    const openConfirm = () => setShowConfirm(true);
    const closeConfirm = () => setShowConfirm(false);

    const deleteConfirm = async () => {
        if (!selectedBuilding)return;
        const success = await server.deleteBuilding(
        selectedBuilding.id, 
        selectedBuilding.villageId
        );

        if(success){
            village.removeBuilding(selectedBuilding);
            village.selectBuilding(null);
            closeConfirm();
        }else{
            console.log("Не удалось удалить здание")
        }
    };

    return (
        <div className="BuildingMenu">
            <div 
                className="menu-overlay" 
                onClick={() => village.selectBuilding(null)}
            >
                <div 
                    className="menu-container"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="menu-header">
                        <div className="name-lvl">
                            {selectedBuilding.type.name} (lvl {selectedBuilding.level})
                        </div>
                        <div className="hp-status">
                            HP: {selectedBuilding.hp}/{selectedBuilding.maxHp}
                        </div>
                    </div>
                    <div className="menu-footer">
                        <button className="levelup-button">Level Up</button>
                        <button className="delete-button"
                        onClick={openConfirm}
                        >Delete</button>
                    </div>
                </div>
            </div>
        {showConfirm && (
            <div className="confirm-overlay" onClick={closeConfirm}>
                <div className="confirm-container" onClick={e => e.stopPropagation()}>
                    <p>
                        Вы точно хотите удалить <strong>
                            {selectedBuilding.type.name} (lvl {selectedBuilding.level})
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