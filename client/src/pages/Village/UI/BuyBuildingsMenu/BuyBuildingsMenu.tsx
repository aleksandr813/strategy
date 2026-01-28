import React, { useEffect, useContext, useState } from 'react';
import GAMECONFIG from '../../../../game/gameConfig';
import { GameContext } from '../../../../App';
import { TBuildingType } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Store from '../../../../services/store/Store';
import Mediator from '../../../../services/mediator/Mediator';

import './BuyBuildingsMenu.scss'

interface BuyBuildingMenuProps extends IBaseUIElement {
    store: Store;
    mediator: Mediator;
}

const BuyBuildingsMenu: React.FC<BuyBuildingMenuProps> = (props: BuyBuildingMenuProps) => {
    const { setUIElement, store } = props;
    const gold = store.getMoney();
    
    const game = useContext(GameContext);
    const village = game.getVillage();
    const [buildingTypes, setBuildingTypes] = useState<TBuildingType[]>([]);
    const [townHallLevel, setTownHallLevel] = useState(0);

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
        const currentGold = Number(gold);
        const buildingPrice = Number(building.priceLevel1);

        if (townHallLevel < building.unlockLevel) {
            alert(`Для покупки ${building.type} нужна ратуша уровня ${building.unlockLevel}`);
            return;
        }

        if (currentGold < buildingPrice) {
            alert(`Недостаточно монет для покупки ${building.type}. Нужно ${buildingPrice}, у вас: ${currentGold}`);
            return;
        }

        console.log(`Покупка здания: ${building.type} c id: ${building.id}`);
        village.getScene().unitPreview.deactivate();
        let size = 2;
        if (building.id == 4) {
            size = 1;
        }
        village.getScene().buildingPreview.activate(building.id, size);
        setUIElement(UIELEMENT.NULL);
    };

    const isBuildingAvailable = (building: TBuildingType): boolean => {
        const currentGold = Number(gold);
        const buildingPrice = Number(building.priceLevel1);
        return townHallLevel >= building.unlockLevel && currentGold >= buildingPrice;
    }; 

    useEffect(() => {
        (async () => {
            await village.loadBuildings();
            setBuildingTypes(await loadBuildingTypes());
            const level = village.getTownHallLevel(); 
            setTownHallLevel(level);
        })();
    }, []);

    return (
        <div className="buy-buildings-menu-overlay" onClick={closeBuyMenu}>
            <div className="buy-buildings-menu-container" onClick={(e) => e.stopPropagation()}>
                <h3 className="buy-buildings-menu-title">
                    Выберите здание
                    <div className='money-indicator'>
                        Монеты: {gold}
                    </div>
                </h3>

                <div className="buy-buildings-items-list">
                    {buildingTypes.map((building) => (
                        <div 
                            key={building.id} 
                            className={`buy-buildings-menu-item ${!isBuildingAvailable(building) ? 'disabled' : ''}`}
                        >
                            <div className="building-info">
                                <span className="building-name">{building.type}</span>
                                <span className="building-details">
                                    {building.unlockLevel > 0 && `Ур. Ратуши ${building.unlockLevel} `}<br/>
                                    HP: {building.hpLevel1} <br/> Цена: {building.priceLevel1}
                                </span>
                            </div>
                            <button
                                className="buy-buildings-menu-button"
                                onClick={() => buyBuilding(building)}
                                disabled={!isBuildingAvailable(building)}
                            >
                                Купить
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    className="buy-buildings-menu-close-button"
                    onClick={closeBuyMenu}
                >
                    Закрыть
                </button>
            </div>
        </div>
    )
}

export default BuyBuildingsMenu;