import React, { useEffect, useContext, useState } from 'react';
import { GameContext } from '../../../../App';
import { TUnitType } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Mediator from '../../../../services/mediator/Mediator';
import Store from '../../../../services/store/Store';

import './BuyUnitsMenu.scss'

interface BuyUnitsMenuProps extends IBaseUIElement {
    store: Store;
    mediator: Mediator;
}

const BuyUnitsMenu: React.FC<BuyUnitsMenuProps> = (props: BuyUnitsMenuProps) => {
    const { setUIElement, store } = props;
    const gold = store.getMoney();

    const game = useContext(GameContext);
    const village = game.getVillage();
    const [unitsTypes, setUnitTypes] = useState<TUnitType[]>([]);
    const [barracksLevel, setBarracksLevel] = useState(0);

    const closeBuyMenu = () => setUIElement(UIELEMENT.NULL);

    const loadUnitTypes = async (): Promise<TUnitType[]> => {
        const server = new Server(game['store']);
        const types = await server.getUnitsTypes();
        console.log("ТИПЫ ЮНИТОВ", types);
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
        <div className='buy-units-menu-overlay' onClick={closeBuyMenu}>
            <div className='buy-units-menu-container' onClick={(e) => e.stopPropagation()}>
                <h3 className='buy-units-menu-title'>
                    Выберите юнита
                    <div className='money-indicator'>
                        Монеты: {gold}
                    </div>
                </h3>

                <div className="buy-units-items-list">
                    {unitsTypes.map((unit) => (
                        <div
                            key={unit.id}
                            className={`buy-units-menu-item ${!isUnitAvailable(unit) ? 'disabled' : ''}`}
                        >
                            <div className='unit-info'>
                                <span className='unit-name'>{unit.type}</span>
                                <span className='unit-details'>
                                    {unit.unlockLevel > 0 && `Ур. Казармы: ${unit.unlockLevel}`} <br/>
                                    HP: {unit.hp} <br/> Цена: {unit.price}
                                </span>
                            </div>
                            <button
                                className='buy-units-menu-button'
                                onClick={() => buyUnit(unit)}
                                disabled={!isUnitAvailable(unit)}
                            >
                                Купить
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    className='buy-units-menu-close-button'
                    onClick={closeBuyMenu}
                >
                    Закрыть
                </button>
            </div>
        </div>
    )
}

export default BuyUnitsMenu;