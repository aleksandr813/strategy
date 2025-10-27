import React, { useContext, useEffect, useState } from 'react';
import CONFIG from '../../config';
import { BuildingType } from '../../services/server/types';
import Button from '../../components/Button/Button';
import { VillageContext, ServerContext } from '../../App';
import VillageManager from './villageDataManager';
import Building from '../../game/Buildings/Building';
import "./BuildingMenu.css";

const UI: React.FC = () => {
    const [showBuyMenu, setShowBuyMenu] = useState(false);
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const server = useContext(ServerContext);
    const village = useContext(VillageContext);
    const villageManager = new VillageManager(server);

    const buyButtonHandler = () => setShowBuyMenu(true);
    const closeBuyMenu = () => setShowBuyMenu(false);

    const buyBuilding = async (building: BuildingType) => {
        console.log(`Покупка здания: ${building.name}`);
        village.getScene().buildingPreview.activate(building.name, building.id, building.hp);
        closeBuyMenu();
    };

    useEffect(() => {
        (async () => {
            setBuildingTypes(await villageManager.loadBuildingTypes());
        })();
    }, []);

    useEffect(() => {
        const handleBuildingSelected = (building: Building | null) => {
            setSelectedBuilding(building);
        };

        village.on('buildingSelected', handleBuildingSelected);

        return () => {
            village.off('buildingSelected', handleBuildingSelected);
        };
    }, [village]);

    return (
        <div className="VillageUI">
            {/* Первая часть интерфейса */}
            <Button text="Купить здания" onClick={buyButtonHandler} />

            {/* Меню покупки */}
            {showBuyMenu && (
                <div className="buy-menu-overlay" onClick={closeBuyMenu}>
                    <div className="buy-menu-container" onClick={(e) => e.stopPropagation()}>
                        <h3 className="buy-menu-title">Выберите здание</h3>

                        {buildingTypes.map((building) => (
                            <div key={building.id} className="buy-menu-item">
                                <div className="building-info">
                                    <span className="building-name">{building.name}</span>
                                    <span className="building-details">
                                        HP: {building.hp} | Цена: {building.price}
                                    </span>
                                </div>
                                <Button onClick={() => buyBuilding(building)} text="Купить" />
                            </div>
                        ))}

                        <Button onClick={closeBuyMenu} text="Закрыть" className="buy-menu-close-button" />
                    </div>
                </div>
            )}
            {selectedBuilding && (
                <div className="BuildingMenu">
                    <h3>Меню здания</h3>
                    <div 
                    className="menu-overlay"
                    onClick={() => village.selectBuilding(null)}
                    >
                        <div className="menu-container"
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
                                <button className="delete-button">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UI;
