import React, { useEffect, useContext, useState } from 'react';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import { GameContext } from '../../../../App';
import { TUnitType } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';

import './BuyUnitsMenu.scss'

const BuyUnitsMenu: React.FC<IBaseUIElement> = (props: IBaseUIElement) => {
    const { setUIElement } = props;

    const game = useContext(GameContext);
    const village = game.getVillage();
    const [unitsTypes, setUnitTypes] = useState<TUnitType[]>([]);

    const closeBuyMenu = () => setUIElement(UIELEMENT.NULL);

    const loadUnitTypes = async (): Promise<TUnitType[]> => {
        const server = new Server(game['store']);
        const types = await server.getUnitsTypes();
        console.log(types);
        return types || [];
    }

    const buyUnit = async (unit: TUnitType) => {
        console.log(`Покупка юнита: ${unit.name}`);
        village.getScene().unitPreview.activate(unit.name, unit.id, unit.hp);
        setUIElement(UIELEMENT.NULL);
    };

    useEffect(() => {
        (async () => {
            setUnitTypes(await loadUnitTypes());
        })();
    }, []);

    return (
        <div>
            <div className='buy-menu-overlay' onClick={closeBuyMenu}>
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
                            <Button onClick={() => buyUnit(unit)} text='Купить' />
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