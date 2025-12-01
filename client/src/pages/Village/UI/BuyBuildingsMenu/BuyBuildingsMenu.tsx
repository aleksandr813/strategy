import React, { useEffect, useContext, useState } from 'react';
import GAMECONFIG from '../../../../game/gameConfig';
import { GameContext } from '../../../../App';
import { TBuildingType } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Store from '../../../../services/store/Store';
import { useStoreMoney } from '../../../../hooks/useStore';

import './BuyBuildingsMenu.scss'

interface BuyBuildingMenuProps extends IBaseUIElement {
    store: Store;
}

const BuyBuildingsMenu: React.FC<BuyBuildingMenuProps> = (props: BuyBuildingMenuProps) => {
    const { setUIElement, store } = props;
    const gold = useStoreMoney(store);
    

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
        if (townHallLevel < building.unlockLevel) {
            alert(`Для покупки ${building.type} нужна ратуша уровня ${building.unlockLevel}`);
            return;
        }
        console.log(`Покупка здания: ${building.type} c id: ${building.id}`);
        village.getScene().unitPreview.deactivate();
        let size = 2;
        if (building.type === 'wall') {
            size = 1;
        }
        village.getScene().buildingPreview.activate(building.id, size);
        setUIElement(UIELEMENT.NULL);
    };

    const isBuildingAvailable = (building: TBuildingType): boolean => {
        console.log("ТИПЫ ЗДАНИЙ",building);
        console.log("УРОВЕНЬ РАТУШИ В СРАВНЕНИИ", townHallLevel);
        console.log("УРОВЕНЬ ЗДАНИЯ В СРАВНЕНИИ:", building.unlockLevel);
        console.log("СРАВНЕНИЕ", townHallLevel >= building.unlockLevel)
        return townHallLevel >= building.unlockLevel;
    }; 

    useEffect(() => {
        (async () => {
            await village.loadBuildings();
            setBuildingTypes(await loadBuildingTypes());
            const level = village.getTownHallLevel(); 
            console.log("ЗАГРУЖЕН УРОВЕНЬ РАТУШИ:", level);
            setTownHallLevel(level);
        })();
    }, []);

    return (
        <div>
            <div className="buy-menu-overlay" onClick={closeBuyMenu}>
                <div className="buy-menu-container" onClick={(e) => e.stopPropagation()}>
                    <h3 className="buy-menu-title">
                        Выберите здание
                        <div className='money-indicator'>
                            Монеты: {gold}
                        </div>
                    </h3>

                    {
                        buildingTypes.map((building) => (
                            <div key={building.id} className={`buy-menu-item ${!isBuildingAvailable(building) ? 'disabled' : ''}`}>
                                <div className="building-info">
                                    <span className="building-name">{building.type}</span>
                                    <span className="building-details">
                                        HP: {building.hp} | Цена: {building.price}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => buyBuilding(building)}
                                    text='Купить'
                                    isDisabled={!isBuildingAvailable(building)}
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