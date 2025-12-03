import React, { useEffect, useContext, useState } from 'react';
import { GameContext } from '../../../../App';
import { TUnitType } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import { BuildingTypeID } from '../../../../services/server/types';
import { useStoreMoney } from '../../../../hooks/useStore';

import './BuyUnitsMenu.scss'
import Store from '../../../../services/store/Store';

interface BuyUnitsMenuProps extends IBaseUIElement {
    store: Store;
}

const BuyUnitsMenu: React.FC<BuyUnitsMenuProps> = (props: BuyUnitsMenuProps) => {
    const { setUIElement, store } = props;
    const gold = useStoreMoney(store);

    const game = useContext(GameContext);
    const village = game.getVillage();
    const [unitsTypes, setUnitTypes] = useState<TUnitType[]>([]);
    const [barracksLevel, setBarracksLevel] = useState(0);

    const closeBuyMenu = () => setUIElement(UIELEMENT.NULL);

    const loadUnitTypes = async (): Promise<TUnitType[]> => {
        const server = new Server(game['store']);
        const types = await server.getUnitsTypes();
        console.log("ТИПЫ ЮНИТОВ",types);
        return types || [];
    }

    const buyUnit = async (unit: TUnitType) => {
        if (barracksLevel < unit.unlockLevel) {
            alert(`Для покупки ${unit.type} нужна казарма уровня ${unit.unlockLevel}`);
            return;
        }
        console.log(`Покупка юнита: ${unit.type}`);
        village.getScene().buildingPreview.deactivate();
        village.getScene().unitPreview.activate(unit.id);
        setUIElement(UIELEMENT.NULL);
    };

    const isUnitAvailable = (unit: TUnitType): boolean => {
        console.log("ТИПЫ ЮНИТОВ",unit);
        console.log("УРОВЕНЬ КАЗАРМЫ В СРАВНЕНИИ", barracksLevel);
        console.log("УРОВЕНЬ ЮНИТА В СРАВНЕНИИ:", unit.unlockLevel);
        console.log("СРАВНЕНИЕ", barracksLevel >= unit.unlockLevel)
        return barracksLevel >= unit.unlockLevel;
    };

    useEffect(() => {
        (async () => {
            await village.loadBuildings();
            const level = village.getBarracksLevel(); 
            console.log("ЗАГРУЖЕН УРОВЕНЬ КАЗАРМЫ:", level);
            setBarracksLevel(level);

            setUnitTypes(await loadUnitTypes());
        })();
    }, [village]);
    return (
        <div>
            <div className='buy-menu-overlay' onClick={closeBuyMenu}>
                <div className='buy-menu-container' onClick={(e) => e.stopPropagation()}>
                    <h3 className='buy-menu-title'>
                        Выберите юнита
                        <div className='money-indicator'>
                            Монеты: {gold}
                        </div>
                    </h3>

                    {unitsTypes.map((unit) => (
                        <div
                            key={unit.id}
                            className={`buy-menu-item ${!isUnitAvailable(unit) ? 'disabled' : ''}`}
                        >
                            <div className='unit-info'>
                                <span className='unit-name'>{unit.type}</span>
                                <span className='unit-details'>
                                    HP: {unit.hp} | Цена: {unit.price}
                                </span>
                            </div>

                            <Button
                                onClick={() => buyUnit(unit)}
                                text='Купить'
                                isDisabled={!isUnitAvailable(unit)}
                            />
                        </div>
                    ))}


                    <Button
                        className='buy-menu-close-button'
                        onClick={closeBuyMenu}
                        text='Закрыть' />
                </div>
            </div>
        </div>
    )
}

export default BuyUnitsMenu;