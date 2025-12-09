import React, { useEffect, useContext, useState } from 'react';
import { GameContext, ServerContext } from '../../../../App';
import { TUnitType, TUser, TUserArmy } from '../../../../services/server/types';
import Server from '../../../../services/server/Server';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Mediator from '../../../../services/mediator/Mediator';
import { BuildingTypeID } from '../../../../services/server/types';
import Store from '../../../../services/store/Store';

import './ArmyMenu.scss'

interface ArmyMenuProps extends IBaseUIElement {
    store: Store;
    mediator: Mediator
}

const ArmyMenu: React.FC<ArmyMenuProps> = (props: ArmyMenuProps) => {
    const game = useContext(GameContext);
    const village = game.getVillage();
    const server = useContext(ServerContext);
    const { setUIElement, store } = props;
    const [armies, setArmies] = useState<TUserArmy[]>([]);

    useEffect(() => {
        const fetchArmies = async () => {
            const armiesData = await server.getUserArmies();
            if (armiesData) {
                setArmies(armiesData);
            }
        };
        
        fetchArmies();
    }, [server]);

    const closeArmyMenu = () => setUIElement(UIELEMENT.NULL);
    
    const handleReturnArmy = (armyIndex: number) => {
        console.log('Returning army:', armyIndex);
        // Здесь добавить логику возврата армии
    };

    return (
        <div>
            <div className='army-menu-overlay' onClick={closeArmyMenu}>
                <div className='army-menu-container' onClick={(e) => e.stopPropagation()} >
                    <div className='army-menu-title'>Армии в походе</div>
                    
                    {!armies || armies.length === 0 ? (
                        <div className='army-menu-empty'>Нет армий в походе</div>
                    ) : (
                        <div className='armies-list'>
                            {armies.map((army, index) => (
                                <div key={index} className='army-menu-item'>
                                    <div className='unit-info'>
                                        <div className='unit-name'>Армия #{index + 1}</div>
                                        <div className='unit-details'>
                                            <div>Юниты: {army.units.join(', ')}</div>
                                            <div>Противник: {army.enemyName}</div>
                                            <div>Скорость: {army.speed}</div>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleReturnArmy(index)}>Вернуть</Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button className='army-menu-close-button' onClick={closeArmyMenu}>
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ArmyMenu;