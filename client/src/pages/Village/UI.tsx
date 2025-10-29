import React, { useContext, useEffect, useState } from 'react';
import CONFIG from '../../config';
import { BuildingType } from '../../services/server/types';
import Button from '../../components/Button/Button';
import { VillageContext, ServerContext } from '../../App';
import VillageManager from './villageDataManager';
import Building from '../../game/Buildings/Building';
import BuildingMenu from './UI/BuildingMenu';

const UI: React.FC = () => {
    const [showBuyMenu, setShowBuyMenu] = useState(false);
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
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
            <BuildingMenu />
        </div>
    );
};

export default UI;
