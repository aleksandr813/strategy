import React, { useEffect, useContext, useState } from 'react';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import { VillageContext, ServerContext } from '../../../../App';
import { BuildingTypeResponse, BuildingType } from '../../../../services/server/types';
import VillageManager from '../../villageDataManager';

const BuyBuildingsMenu: React.FC<IBaseUIElement> = (props: IBaseUIElement) => {

    const { setUIElement } = props;

    const village = useContext(VillageContext);
    const server = useContext(ServerContext);
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
    const villageManager = new VillageManager(server);

    const closeBuyMenu = () => setUIElement(UIELEMENT.NULL);

    const buyBuilding = async (building: BuildingType) => {
        console.log(`Покупка здания: ${building.name}`);
        village.getScene().buildingPreview.activate(building.name, building.id, building.hp);
        setUIElement(UIELEMENT.NULL);
    };

    useEffect(() => {
        (async () => {
            setBuildingTypes(await villageManager.loadBuildingTypes());
        })();
    }, []);


    return (
        <div>
            {
                <div className="buy-menu-overlay" onClick={closeBuyMenu}>
                    <div className="buy-menu-container" onClick={(e) => e.stopPropagation()}>
                        <h3 className="buy-menu-title">
                            Выберите здание
                        </h3>

                        {
                            buildingTypes.map((building) => (
                                <div key={building.id} className="buy-menu-item">
                                    <div className="building-info">
                                        <span className="building-name">{building.name}</span>
                                        <span className="building-details">
                                            HP: {building.hp} | Цена: {building.price}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => buyBuilding(building)}
                                        text='Купить'
                                    />
                                </div>
                            ))
                        }

                        <Button
                            onClick={closeBuyMenu}
                            text='Закрыть'
                            className="buy-menu-close-button"
                        />
                    </div>
                </div>
            }
        </div>
    )
}

export default BuyBuildingsMenu;