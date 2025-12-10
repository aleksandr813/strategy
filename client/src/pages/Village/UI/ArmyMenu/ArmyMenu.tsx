import React, { useEffect, useContext, useState } from 'react';
import { GameContext, ServerContext } from '../../../../App';
import { TUnitType, TUser, TUserArmy } from '../../../../services/server/types';
import Button from '../../../../components/Button/Button';
import { UIELEMENT, IBaseUIElement } from '../UI';
import Mediator from '../../../../services/mediator/Mediator';
import { BuildingTypeID } from '../../../../services/server/types';
import Store from '../../../../services/store/Store';
import VillageEntity from '../../../../game/entities/VillageEntity';

import './ArmyMenu.scss'

interface ArmyMenuProps extends IBaseUIElement {
    store: Store;
    mediator: Mediator
}

enum VIEW_MODE {
    SELECTED_UNITS,
    ARMIES_LIST,
    VILLAGE_SELECT
}

const ArmyMenu: React.FC<ArmyMenuProps> = (props: ArmyMenuProps) => {
    const game = useContext(GameContext);
    const { setUIElement, store } = props;
    const [armies, setArmies] = useState<TUserArmy[]>([]);
    const [viewMode, setViewMode] = useState<VIEW_MODE>(VIEW_MODE.SELECTED_UNITS);
    const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
    const [villages, setVillages] = useState<VillageEntity[]>([]);

    useEffect(() => {
        const units = game.village.getScene().units;
        const selected = units.filter(unit => unit.isSelected).map(unit => unit.id);
        setSelectedUnits(selected);
        
        fetchArmies();
        loadVillages();
        
        if (selected.length === 0) {
            setViewMode(VIEW_MODE.ARMIES_LIST);
        }
    }, []);

    const closeArmyMenu = () => setUIElement(UIELEMENT.NULL);

    const fetchArmies = async () => {
        const userArmies = await game.globalMap.getUserArmies();
        setArmies(Array.isArray(userArmies) ? userArmies : []);
    };

    const loadVillages = () => {
        const villagesData = game.getVillages();
        //console.log(villages)
        setVillages(villagesData);
    };
    
    const handleReturnArmy = async (armyId: number) => {
        await game.globalMap.moveArmyBack(armyId);
        await fetchArmies();
    };

    const handleShowVillageSelect = () => {
        setViewMode(VIEW_MODE.VILLAGE_SELECT);
    };

    const handleSelectVillage = async (villageId: number) => {
        if (selectedUnits.length === 0) {
            console.log('Нет выделенных юнитов');
            return;
        }
        
        const result = await game.village.sendArmy(villageId, selectedUnits);
        
        if (result) {
            console.log('Армия успешно отправлена');
            closeArmyMenu();
        } else {
            console.error('Ошибка отправки армии');
        }
    };

    const renderSelectedUnitsView = () => (
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
                <Button onClick={handleShowVillageSelect}>Отправить</Button>
            </div>

            <button 
                className='army-menu-show-armies-button' 
                onClick={() => setViewMode(VIEW_MODE.ARMIES_LIST)}
            >
                Армии
            </button>

            <button className='army-menu-close-button' onClick={closeArmyMenu}>
                Закрыть
            </button>
        </div>
    );

    const renderArmiesListView = () => (
        <div>
            <div className='army-menu-title'>Армии в походе</div>
            
            {!armies ? (
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
                    onClick={() => setViewMode(VIEW_MODE.SELECTED_UNITS)}
                >
                    Назад
                </button>
            )}

            <button className='army-menu-close-button' onClick={closeArmyMenu}>
                Закрыть
            </button>
        </div>
    );

    const renderVillageSelectView = () => (
        <div>
            <div className='army-menu-title'>Выберите цель</div>
            
            {!villages || villages.length === 0 ? (
                <div className='army-menu-empty'>Нет доступных деревень</div>
            ) : (
                <div className='villages-list'>
                    {villages.map((village, index) => (
                        <div 
                            key={village.id} 
                            className='army-menu-item village-item'
                            onClick={() => handleSelectVillage(village.id)}
                        >
                            <div className='unit-info'>
                                <div className='unit-name'>{village.name}</div>
                                <div className='unit-details'>
                                    <div>Координаты: ({village.coords.x}, {village.coords.y})</div>
                                </div>
                            </div>
                            <Button onClick={() => handleSelectVillage(village.id)}>Атаковать</Button>
                        </div>
                    ))}
                </div>
            )}

            <button 
                className='army-menu-back-button' 
                onClick={() => setViewMode(VIEW_MODE.SELECTED_UNITS)}
            >
                Назад
            </button>

            <button className='army-menu-close-button' onClick={closeArmyMenu}>
                Закрыть
            </button>
        </div>
    );

    const renderView = () => {
        switch (viewMode) {
            case VIEW_MODE.VILLAGE_SELECT:
                return renderVillageSelectView();
            case VIEW_MODE.ARMIES_LIST:
                return renderArmiesListView();
            case VIEW_MODE.SELECTED_UNITS:
            default:
                return renderSelectedUnitsView();
        }
    };

    return (
        <div>
            <div className='army-menu-overlay' onClick={closeArmyMenu}>
                <div className='army-menu-container' onClick={(e) => e.stopPropagation()} >
                    {renderView()}
                </div>
            </div>
        </div>
    )
}

export default ArmyMenu;