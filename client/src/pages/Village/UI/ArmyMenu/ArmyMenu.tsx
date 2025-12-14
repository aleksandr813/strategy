import React, { useEffect, useContext, useState } from 'react';
import { GameContext } from '../../../../App';
import { TUserArmy } from '../../../../services/server/types';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Mediator from '../../../../services/mediator/Mediator';
import Store from '../../../../services/store/Store';
import { PAGES } from '../../../PageManager';

import './ArmyMenu.scss'

interface ArmyMenuProps extends IBaseUIElement {
    store: Store;
    mediator: Mediator;
    setPage: (name: PAGES) => void;
}

const ArmyMenu: React.FC<ArmyMenuProps> = (props: ArmyMenuProps) => {
    const game = useContext(GameContext);
    const { setUIElement, setPage } = props;
    const [armies, setArmies] = useState<TUserArmy[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
    const [showArmiesList, setShowArmiesList] = useState(false);

    useEffect(() => {
        const units = game.village.getScene().units;
        const selected = units.filter(unit => unit.isSelected).map(unit => unit.id);
        setSelectedUnits(selected);
        fetchArmies();
        
        if (selected.length === 0) {
            setShowArmiesList(true);
        }
    }, []);

    const closeArmyMenu = () => setUIElement(UIELEMENT.NULL);

    const fetchArmies = async () => {
        const userArmies = await game.globalMap.getUserArmies();
        setArmies(Array.isArray(userArmies) ? userArmies : []);
    };

    const handleSendArmy = () => {
        setUIElement(UIELEMENT.NULL);
        game.globalMap.sendingArmy = true;
        setPage(PAGES.GLOBAL_MAP);
    };
    
    const handleReturnArmy = async (armyId: number) => {
        await game.globalMap.moveArmyBack(armyId);
        await fetchArmies();
    };

    return (
        <div className='army-menu-overlay' onClick={closeArmyMenu}>
            <div className='army-menu-container' onClick={(e) => e.stopPropagation()}>
                {!showArmiesList ? (
                    <div>
                        <div className='army-menu-title'>Отправить армию</div>
                        
                        <div className='selected-units-block'>
                            <div className='unit-info'>
                                <div className='unit-name'>Выделенные юниты</div>
                                <div className='unit-details'>
                                    <div>Количество: {selectedUnits.length}</div>
                                    <div>ID юнитов: {selectedUnits.join(', ')}</div>
                                </div>
                            </div>
                            <Button onClick={() => handleSendArmy()}>Отправить</Button>
                        </div>

                        <button 
                            className='army-menu-show-armies-button' 
                            onClick={() => setShowArmiesList(true)}
                        >
                            Армии
                        </button>

                        <button className='army-menu-close-button' onClick={closeArmyMenu}>
                            Закрыть
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className='army-menu-title'>Армии в походе</div>
                        
                        {armies.length === 0 ? (
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
                                        <Button onClick={() => handleReturnArmy(army.armyId)}>Вернуть</Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedUnits.length > 0 && (
                            <button 
                                className='army-menu-back-button' 
                                onClick={() => setShowArmiesList(false)}
                            >
                                Назад
                            </button>
                        )}

                        <button className='army-menu-close-button' onClick={closeArmyMenu}>
                            Закрыть
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ArmyMenu;