import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import CONFIG from '../../config';
import { BuildingType, BuildingTypeResponse } from '../../services/server/types';
import Button from '../../components/Button/Button';
import { GameContext, ServerContext } from '../../App';

import "./UI.scss"

const UI: React.FC = () => {
    const [showBuyMenu, setShowBuyMenu] = React.useState(false);
    const server = useContext(ServerContext)
    const game = useContext(GameContext)
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);

    const buyButtonHandler = () => {
        setShowBuyMenu(true);
    };

    const closeBuyMenu = () => {
        setShowBuyMenu(false);
    };

    const buyBuilding = async (building: BuildingType) => {
        console.log(`Покупка здания: ${building.name}`);
        game.getScene().buildingPreview.activate(building.name, building.id, building.hp);
        closeBuyMenu();
    };

    useEffect(() => {
        const fetchBuildingTypes = async () => {
            try {
                const response = await server.getBuildingTypes();
                
                if (response && response.building_types && response.building_types.length > 0) {
                    const convertedTypes: BuildingType[] = response.building_types.map((type: BuildingTypeResponse) => ({
                        id: Number(type.id),
                        type: type.type,
                        name: type.name,
                        hp: Number(type.hp),
                        price: Number(type.price),
                        sprite: Number(type.sprite_id)
                    }));
                    setBuildingTypes(convertedTypes);
                } else {
                    console.error('Пустой массив типов зданий');
                    setBuildingTypes([]);
                }
            } catch (error) {
                console.error('Ошибка получения типов зданий:', error);
                setBuildingTypes([]);
            }
        };

        fetchBuildingTypes();
    }, [server]);

    return (
    <div className='village-ui'>
        
        <Button text='Купить здания' onClick={buyButtonHandler} className="pixel-button"/>
        {showBuyMenu && (
            <div className="buy-menu-overlay" onClick={closeBuyMenu}>
                <div className="buy-menu-container" onClick={(e) => e.stopPropagation()}>
                    <h3 className="buy-menu-title">
                        Выберите здание
                    </h3>
                    
                    {buildingTypes.map((building) => (
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
                                className="pixel-button small"
                            />
                        </div>
                    ))}
                    
                    <Button 
                        onClick={closeBuyMenu} 
                        text='Закрыть'
                        className="pixel-button buy-menu-close-button"
                    />
                </div>
            </div>
        )}
    </div>
    );
};

export default UI;