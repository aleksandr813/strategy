import React, { useContext, useEffect, useState } from 'react';
import { VillageContext } from '../../../App';
import Building from '../../../game/Buildings/Building';
import Button from '../../../components/Button/Button';
import "./BuildingMenu.css";

const BuildingMenu: React.FC = () => {
    const village = useContext(VillageContext);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

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

    const deleteHandler = () => {
        
    }

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
                        <button className="levelup-button">Улучшить</button>
                        <Button onClick={deleteHandler} className='delete-button' text='Удалить' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuildingMenu;