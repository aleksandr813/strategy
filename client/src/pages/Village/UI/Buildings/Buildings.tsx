import React, { useEffect, useContext, useState } from 'react';
import Button from '../../../../components/Button/Button';
import { IBasePagePanel, PAGESPANEL } from '../UI';
import { GameContext, ServerContext } from '../../../../App';
import { BuildingTypeResponse, BuildingType } from '../../../../services/server/types';

const Buildings: React.FC<IBasePagePanel> = (props: IBasePagePanel) => {

    const { setPagePanel } = props;

    const game = useContext(GameContext);
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
    const server = useContext(ServerContext);

    const closeBuyMenu = () => setPagePanel(PAGESPANEL.NULL);

    const buyBuilding = async (building: BuildingType) => {
        console.log(`Покупка здания: ${building.name}`);
        game.getScene().buildingPreview.activate(building.name, building.id, building.hp);
        setPagePanel(PAGESPANEL.NULL);
    };

    useEffect(() => {
        const fetchBuildingTypes = async () => {
            try {
                const response = await server.getBuildingTypes();

                if (response && response.building_types && response.building_types.length > 0) {
                    const convertedTypes: BuildingType[] = response.building_types.map((type: BuildingTypeResponse) => ({
                        id: Number(type.id),
                        type: type.type,
                        name: type.name,
                        hp: Number(type.hp),
                        price: Number(type.price)
                    }));
                    setBuildingTypes(convertedTypes);
                } else {
                    console.error('Пустой массив типов зданий');
                    setBuildingTypes([]);
                }
            } catch (error) {
                console.error('Ошибка получения типов зданий:', error);
                setBuildingTypes([]);
            }
        };

        fetchBuildingTypes();
    }, [server]);


    return (
        <div>
            {
                <div className="buy-menu-overlay" onClick={closeBuyMenu}>
                    <div className="buy-menu-container" onClick={(e) => e.stopPropagation()}>
                        <h3 className="buy-menu-title">
                            Выберите здание
                        </h3>

                        {
                            buildingTypes.map((building) => (
                                <div key={building.id} className="buy-menu-item">
                                    <div className="building-info">
                                        <span className="building-name">{building.name}</span>
                                        <span className="building-details">
                                            HP: {building.hp} | Цена: {building.price}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => buyBuilding(building)}
                                        text='Купить'
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
            }
        </div>
    )
}

export default Buildings;