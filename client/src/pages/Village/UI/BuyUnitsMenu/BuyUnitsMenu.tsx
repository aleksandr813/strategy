import React, { useEffect, useContext, useState } from 'react';
import { GameContext } from '../../../../App';
import { TUnitType } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Mediator from '../../../../services/mediator/Mediator';
import { BuildingTypeID } from '../../../../services/server/types';
import Store from '../../../../services/store/Store';

import './BuyUnitsMenu.scss'

interface BuyUnitsMenuProps extends IBaseUIElement {
    store: Store;
    mediator: Mediator
}

const BuyUnitsMenu: React.FC<BuyUnitsMenuProps> = (props: BuyUnitsMenuProps) => {
    const { setUIElement, store } = props;
    const gold = store.getMoney()

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
        const currentGold = Number(gold);
        const unitPrice = Number(unit.price);

        if (barracksLevel < unit.unlockLevel) {
            alert(`Для покупки ${unit.type} нужна казарма уровня ${unit.unlockLevel}`);
            return;
        }

        if (currentGold < unitPrice) {
            alert(`Недостаточно монет для покупки ${unit.type}. Нужно ${unitPrice}, у вас: ${currentGold}`);
            return;
        }

        console.log(`Покупка юнита: ${unit.type}`);
        village.getScene().buildingPreview.deactivate();
        village.getScene().unitPreview.activate(unit.id);
        setUIElement(UIELEMENT.NULL);
    };

    const isUnitAvailable = (unit: TUnitType): boolean => {
        const currentGold = Number(gold);
        const unitPrice = Number(unit.price);
        
        console.log("ТИПЫ ЮНИТОВ",unit);
        console.log("УРОВЕНЬ КАЗАРМЫ В СРАВНЕНИИ", barracksLevel);
        console.log("УРОВЕНЬ ЮНИТА В СРАВНЕНИИ:", unit.unlockLevel);
        console.log("СРАВНЕНИЕ", barracksLevel >= unit.unlockLevel)
        return barracksLevel >= unit.unlockLevel && currentGold >= unitPrice;
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