import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import CONFIG from '../../config';
import { BuildingType, BuildingTypeResponse, UnitType, UnitTypeResponse } from '../../services/server/types';
import Button from '../../components/Button/Button';
import { VillageContext, ServerContext } from '../../App';
import VillageManager from './villageDataManager';

import "./Village.scss"


const UI: React.FC = () => {
    const [showBuyMenu, setShowBuyMenu] = React.useState(false);
    const [showBuyUnitMenu, setShowBuyUnitMenu] = React.useState(false);
    const server = useContext(ServerContext)
    const village = useContext(VillageContext)
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
    const [unitsTypes, setUnitTypes] = useState<UnitType[]>([]);
    const villageManager = new VillageManager(server)


    const buyButtonHandler = () => {
        setShowBuyMenu(true);
    };

    const closeBuyMenu = () => {
        setShowBuyMenu(false);
    };

    const buyUnitButtonHandler = () => {
        setShowBuyUnitMenu(true);
    };

    const closeBuyUnitMenu = () => {
        setShowBuyUnitMenu(false);
    }

    const buyUnit = async (unit: UnitType) => {
        console.log(`Покупка юнита: ${unit.name}`);
        village.getScene().unitPreview.activate(unit.name, unit.id, unit.hp);
        closeBuyUnitMenu();
    }

    const buyBuilding = async (building: BuildingType) => {
        console.log(`Покупка здания: ${building.name}`);
        village.getScene().buildingPreview.activate(building.name, building.id, building.hp);
        closeBuyMenu();
    };


    useEffect(() => {
        (async () => {
            setBuildingTypes(await villageManager.loadBuildingTypes());
            setUnitTypes(await villageManager.loadUnitTypes());
        })();
    }, []);

    return (
    <div className='VillageUI'>
        <Button text='Купить здания' onClick={buyButtonHandler}/>
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
                            />
                        </div>
                    ))}
                    
                    <Button 
                        onClick={closeBuyMenu} 
                        text='Закрыть'
                        className="buy-menu-close-button"
                    />
                </div>
            </div>
        )}
        <Button onClick={buyUnitButtonHandler} text='Купить юнита'/>
        {showBuyUnitMenu && (
            <div className='buy-menu-overplay' onClick={closeBuyUnitMenu}>
                <div className='buy-menu-container' onClick={(e) => e.stopPropagation()}>
                    <h3 className='buy-menu-title'>
                        Выберите юнита
                    </h3>

                    {unitsTypes.map((unit) => (
                        <div key={unit.id} className='buy-menu-item'>
                            <div className='unit-info'>
                                <span className='unit-name'>{unit.name}</span>
                                <span className='unit-details'>
                                    HP: {unit.hp} | Цена: {unit.price}
                                </span>
                            </div>
                            <Button onClick={() => buyUnit(unit)} text='Купить'/>
                        </div>
                    ))}
                    <Button className='buy-menu-close-button' onClick={closeBuyUnitMenu} text='Закрыть'/>
                </div>
            </div>
        )

        }
    </div>
    );
};

export default UI;