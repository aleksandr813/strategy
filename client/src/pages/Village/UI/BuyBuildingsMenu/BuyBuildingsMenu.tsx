import React, { useEffect, useContext, useState } from 'react';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import { GameContext } from '../../../../App';
import { TBuildingType } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';
import GAMECONFIG from '../../../../game/gameConfig';

import './BuyBuildingsMenu.scss'

const BuyBuildingsMenu: React.FC<IBaseUIElement> = (props: IBaseUIElement) => {
    const { setUIElement } = props;

    const game = useContext(GameContext);
    const village = game.getVillage();
    const [buildingTypes, setBuildingTypes] = useState<TBuildingType[]>([]);

    const closeBuyMenu = () => setUIElement(UIELEMENT.NULL);

    const loadBuildingTypes = async (): Promise<TBuildingType[]> => {
        const server = new Server(game['store']);
        const types = await server.getBuildingTypes();

        const excludedTypes = GAMECONFIG.EXCLUDED_BUILDINGS;
    
        const filteredTypes = types.filter(type => 
            !excludedTypes.includes(type.type)
        );
        return filteredTypes || [];
    }

    const buyBuilding = async (building: TBuildingType) => {
        console.log(`Покупка здания: ${building.name}`);
        village.getScene().unitPreview.deactivate();
        village.getScene().buildingPreview.activate(building.id, building.hp);
        setUIElement(UIELEMENT.NULL);
    };

    useEffect(() => {
        (async () => {
            setBuildingTypes(await loadBuildingTypes());
        })();
    }, []);

    return (
        <div>
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
        </div>
    )
}

export default BuyBuildingsMenu;