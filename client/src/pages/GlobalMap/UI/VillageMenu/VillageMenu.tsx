import React, { useContext, useEffect, useState } from 'react';
import { GameContext, ServerContext } from '../../../../App';
import { PAGES } from '../../../PageManager';
import { GLOBALMAP_UIELEMENT } from '../UI';
import VillageEntity from '../../../../game/entities/VillageEntity';
import Game from '../../../../game/Game';
import Mediator from '../../../../services/mediator/Mediator';

import "./VillageMenu.scss";

interface VillageMenuProps {
    setPage: (name: PAGES) => void;
    setUIElement: (name: GLOBALMAP_UIELEMENT) => void;
    mediator: Mediator;
    game: Game;
}

let selectedUnits: number[];

const VillageMenu: React.FC<VillageMenuProps> = (props: VillageMenuProps) => {
    const {setPage, setUIElement, mediator, game} = props;
    const [selectedVillage, setSelectedVillage] = useState<VillageEntity | null>(null);

    useEffect(() => {
        const units = game.village.getScene().units;
        selectedUnits = units.filter(unit => unit.isSelected).map(unit => unit.id);

        const { VILLAGE_SELECTED } = mediator.getEventTypes();
        
        const handleVillageSelected = (village: VillageEntity | null) => {
            setSelectedVillage(village);
        };

        mediator.subscribe(VILLAGE_SELECTED, handleVillageSelected);

        return () => {
            mediator.unsubscribe(VILLAGE_SELECTED, handleVillageSelected);
        };
    }, [mediator]);

    if (!selectedVillage || !game.globalMap.sendingArmy) return null;

    const handleAttack = (villageId: number) => {
        game.globalMap.sendingArmy = false;
        game.village.sendArmy(villageId, selectedUnits)
        setPage(PAGES.VILLAGE)
    };

    return (
        <div className="VillageMenu">
            <div 
                className="menu-overlay"
                onClick={() => game.globalMap.selectVillage(null)}
            >
                <div 
                    className="menu-container"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="menu-header">
                        <div className="village-name">
                            {selectedVillage.name}
                        </div>
                    </div>
                    <div className="menu-footer">
                        <button className="attack-button" onClick={() => handleAttack(selectedVillage.id)}>
                            Атаковать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VillageMenu;