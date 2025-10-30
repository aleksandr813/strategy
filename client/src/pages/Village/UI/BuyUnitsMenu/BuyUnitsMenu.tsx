import React, { useEffect, useContext, useState } from 'react';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import { VillageContext, ServerContext } from '../../../../App';
import { UnitType, BuildingType } from '../../../../services/server/types';
import VillageManager from '../../villageDataManager';

import './BuyUnitsMenu.scss'

const BuyUnitsMenu: React.FC<IBaseUIElement> = (props: IBaseUIElement) => {

    const { setUIElement } = props;

    const village = useContext(VillageContext);
    const server = useContext(ServerContext);
    const [unitsTypes, setUnitTypes] = useState<UnitType[]>([]);
    const villageManager = new VillageManager(server);

    const closeBuyMenu = () => setUIElement(UIELEMENT.NULL);

    const buyUnit = async (unit: UnitType) => {
        console.log(`Покупка юнита: ${unit.name}`);
        village.getScene().unitPreview.activate(unit.name, unit.id, unit.hp);
        setUIElement(UIELEMENT.NULL);
    };

    useEffect(() => {
        (async () => {
            setUnitTypes(await villageManager.loadUnitTypes());
        })();
    }, []);


    return (
        <div>
            {
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


            }
        </div>
    )
}

export default BuyUnitsMenu;