import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import CONFIG from '../../config';
import { BuildingType, BuildingTypeResponse } from '../../services/server/types';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import Game from '../../game/Game';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units/Unit';
import Building from '../../game/Buildings/Building';
import Allocation from './UI/Allocation';
import BuildingPreview from './UI/BuildingPreview';
import { TPoint } from '../../config';
import { ServerContext } from '../../App';

import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const UI: React.FC<IBasePage> = (props: IBasePage) => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;
    const { setPage } = props;
    let game: Game | null = null;
    let canvas: Canvas | null = null;
    const Canvas = useCanvas(render);
    let interval: NodeJS.Timer | null = null;
    const [[spritesImage], getSprite] = useSprites();
    const allocation = new Allocation();
    const buildingPreviewRef = useRef(new BuildingPreview());
    const buildingPreview = buildingPreviewRef.current;
    const [showBuyMenu, setShowBuyMenu] = React.useState(false);
    const server = useContext(ServerContext)
    const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
    
    const mouseDownPosition = useRef<TPoint | null>(null);
    const mouseDownTime = useRef<number>(0);
    const wasDragging = useRef<boolean>(false);
    const DRAG_THRESHOLD = 5;
    const TIME_THRESHOLD = 200;

    function printFillSprite(image: HTMLImageElement, canvas: Canvas, { x = 0, y = 0 }, points: number[]): void {
        canvas.spriteFull(image, x, y, points[0], points[1], points[2]);
    }

    function printHPBar(
        canvas: Canvas,
        x: number, 
        y: number, 
        widthUnits: number, 
        heightUnits: number, 
        currentHp: number,
        maxHp: number
    ): void {
        if (currentHp >= maxHp) {
            return;
        }

        const ctx = canvas.contextV;
        const hpRatio = currentHp / maxHp;
        const currentHpWidthUnits = widthUnits * hpRatio;

        ctx.fillStyle = "#A00000"; 
        ctx.fillRect(
            canvas.xs(x),
            canvas.ys(y),
            canvas.dec(widthUnits),
            canvas.dec(heightUnits)
        );

        ctx.fillStyle = "#00FF00";
        ctx.fillRect(
            canvas.xs(x),
            canvas.ys(y),
            canvas.dec(currentHpWidthUnits),
            canvas.dec(heightUnits)
        );
    }

    function printUnits(canvas: Canvas, units: Unit[]): void {
        const BAR_WIDTH_UNITS = 0.8;
        const BAR_HEIGHT_UNITS = 0.1;
        const OFFSET_Y_UNITS = 0.1;

        units.forEach((unit) => {
            const displaySelected = allocation.isSelectingStatus
                ? allocation.isUnitInSelection(unit)
                : unit.isSelected;

            printFillSprite(spritesImage, canvas, unit.cords, getSprite(unit.sprite));
            
            if (displaySelected) {
                const ctx = canvas.contextV;
                const unitColor = 'rgba(0, 255, 0, 0.5)';
                ctx.fillStyle = unitColor;

                ctx.fillRect(
                    canvas.xs(unit.cords.x),
                    canvas.ys(unit.cords.y),
                    canvas.dec(1), 
                    canvas.dec(1) 
                );
            }

            const maxHp = unit.maxHp; 
            
            if (unit.hp < maxHp) {
                const barX = unit.cords.x + (1 - BAR_WIDTH_UNITS) / 2; 
                const barY = unit.cords.y - OFFSET_Y_UNITS; 

                printHPBar(
                    canvas, 
                    barX, 
                    barY, 
                    BAR_WIDTH_UNITS, 
                    BAR_HEIGHT_UNITS, 
                    unit.hp, 
                    maxHp
                );
            }
        });
    }
    function printBuilds(canvas: Canvas, buildings: Building[]): void {
        const BAR_HEIGHT_UNITS = 0.2;
        const OFFSET_Y_UNITS = 0.3;

        buildings.forEach((element) => {
            for (let i = 0; i < element.sprites.length; i++) {
                printFillSprite(spritesImage, canvas, element.cords[i], getSprite(element.sprites[i]));
            }

            const maxHp = element.MAX_HP;
            
            if (element.hp < maxHp) {
                const barWidthUnits = element.size;
                const barX = element.cords[0].x;
                const barY = element.cords[0].y - BAR_HEIGHT_UNITS - OFFSET_Y_UNITS;

                printHPBar(
                    canvas, 
                    barX, 
                    barY, 
                    barWidthUnits, 
                    BAR_HEIGHT_UNITS, 
                    element.hp, 
                    maxHp
                );
            }
        });
    }

    function printBuildingPreview(canvas: Canvas): void {
        const previewData = buildingPreview.getRenderData();
        if (!previewData) return;

        const { gridPosition, canPlace } = previewData;
        const ctx = canvas.contextV;
        
        const color = canPlace ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
        ctx.fillStyle = color;

        // Рисуем область 2x2
        ctx.fillRect(
            canvas.xs(gridPosition.x),
            canvas.ys(gridPosition.y),
            canvas.dec(2),
            canvas.dec(2)
        );

        // Рамка
        ctx.strokeStyle = canPlace ? '#00FF00' : '#FF0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            canvas.xs(gridPosition.x),
            canvas.ys(gridPosition.y),
            canvas.dec(2),
            canvas.dec(2)
        );
    }

    function render(FPS: number): void {
        if (canvas && game) {
            canvas.clear();
            const { units, buildings } = game.getScene();

            printUnits(canvas, units);
            printBuilds(canvas, buildings);

            if (allocation.isSelectingStatus) {
                const rect = allocation.getSelectionRect();
                if (rect) {
                    canvas.contextV.fillStyle = "rgba(0, 255, 0, 0.5)";
                    canvas.contextV.fillRect(
                        canvas.xs(rect.x),
                        canvas.ys(rect.y),
                        canvas.dec(rect.width),
                        canvas.dec(rect.height)
                    );
                }
            }

            printBuildingPreview(canvas);

            canvas.text(WINDOW.LEFT + 0.2, WINDOW.TOP + 0.5, String(FPS), GREEN);
            canvas.render();
        }
    }

    const backClickHandler = () => setPage(PAGES.CHAT);
    const BattleClicHandler = () => setPage(PAGES.BATTLE);
    const CalculatorClicHandler = () => setPage(PAGES.CALCULATOR);
    const GlobalMapClicHandler = () => setPage(PAGES.GLOBAL_MAP);
    const VillageClicHandler = () => setPage(PAGES.VILLAGE);

    const buyHandler = () => {
        setShowBuyMenu(true);
    };

    const closeBuyMenu = () => {
        setShowBuyMenu(false);
    };

    const buyBuilding = async (building: BuildingType) => {
        console.log(`Покупка здания: ${building.name}`);
        buildingPreview.activate(building.name, building.id, building.hp);
        closeBuyMenu();
    };

    const mouseDown = (x: number, y: number) => {
        if (!game) return;
        
        if (buildingPreview.isActiveStatus()) {
            return;
        }

        mouseDownPosition.current = { x, y };
        mouseDownTime.current = Date.now();
        wasDragging.current = false;
        allocation.start(x, y);
    };

    const mouseMove = (x: number, y: number) => {
        if (buildingPreview.isActiveStatus() && game) {
            const { units, buildings } = game.getScene();
            const matrix = game.getVillageMatrix(units, buildings);
            buildingPreview.update(x, y, matrix);
        } else {
            allocation.update(x, y);
        }
    };

    const mouseUp = (x: number, y: number) => {
        if (!game) return;
        const { units } = game.getScene();

        const startPos = mouseDownPosition.current;
        if (startPos) {
            const distance = Math.sqrt(
                Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
            );
            const timeElapsed = Date.now() - mouseDownTime.current;

            if (distance > DRAG_THRESHOLD || timeElapsed > TIME_THRESHOLD) {
                wasDragging.current = true;
                allocation.end(units);
            } else {
                allocation.cancel();
            }
        }
        mouseDownPosition.current = null;
        mouseDownTime.current = 0;
    };

    const mouseClick = async (x: number, y: number) => {
        if (!game || wasDragging.current) return;

        // Режим размещения здания
        if (buildingPreview.isActiveStatus()) {
            const newBuilding = buildingPreview.tryPlace();
            if (newBuilding) {
                const typeId = buildingPreview.getBuildingTypeId();
                const pos = buildingPreview.getPlacementPosition();

                console.log('=== DEBUG buyBuilding ===');
                console.log('typeId:', typeId, 'type:', typeof typeId);
                console.log('x:', pos.x, 'type:', typeof pos.x);
                console.log('y:', pos.y, 'type:', typeof pos.y);

                try {
                    const result = await server.buyBuilding(typeId, pos.x, pos.y);

                    console.log('Результат buyBuilding:', result);

                    if (result && !result.error) {
                        game.addBuilding(newBuilding);
                        console.log('Здание успешно построено!', result);
                    } else {
                        console.error('Ошибка при покупке здания:', result?.error || result);
                        buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
                    }
                } catch (error) {
                    console.error('Ошибка запроса:', error);
                    buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
                }
            }
            return;
        }

        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        const { buildings } = game.getScene();

        for (const build of buildings) {
            const buildX = build.cords[0].x;
            const buildY = build.cords[0].y;
            if (gridX >= buildX && gridX < buildX + 2 && gridY >= buildY && gridY < buildY + 2) {
                build.takeDamage(10); 
                console.log(`Building HP: ${build.hp}`);
                return; 
            }
        }

        if (!allocation.isSelectingStatus) {
            game.moveUnits({ x, y });
            console.log('click: move units to', { x, y });
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!game) return;

        // Отмена размещения здания при ПКМ
        if (buildingPreview.isActiveStatus()) {
            buildingPreview.deactivate();
            console.log('Размещение здания отменено');
            return;
        }

        const { units } = game.getScene();
        allocation.clearSelection(units);
        console.log('right click: clear selection');
    };

    useEffect(() => {
        game = new Game();
        canvas = Canvas({
            parentId: GAME_FIELD,
            WIDTH: WINDOW.WIDTH * SPRITE_SIZE,
            HEIGHT: WINDOW.HEIGHT * SPRITE_SIZE,
            WINDOW,
            callbacks: {
                mouseMove,
                mouseDown,
                mouseUp,
                mouseRightClickDown,
                mouseClick,
            },
        });
        return () => {
            game?.destructor();
            canvas?.destructor();
            canvas = null;
            game = null;
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };
    }, []);

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            // Отмена размещения по ESC
            if (event.key === 'Escape' && buildingPreview.isActiveStatus()) {
                buildingPreview.deactivate();
                console.log('Размещение здания отменено (ESC)');
            }
        };
        document.addEventListener('keydown', keyDownHandler);
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);

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
    <div className='game'>
        <h1>Менеджмент деревни</h1>
        <Button onClick={BattleClicHandler} text='Battle'/>
        <Button onClick={CalculatorClicHandler} text='Calculator'/>
        <Button onClick={GlobalMapClicHandler} text='GlobalMap'/>
        <Button onClick={VillageClicHandler} text='Village'/>
        <Button onClick={backClickHandler} text='Назад' />
        <div id={GAME_FIELD} className={GAME_FIELD}></div>
        <div className='villageManagmentUI'>
            <Button onClick={buyHandler} text='Купить'/>
        </div>

        {showBuyMenu && (
            <div className="buy-menu-overlay" onClick={closeBuyMenu}>
                <div className="buy-menu-container" onClick={(e) => e.stopPropagation()}>
                    <h3 className="buy-menu-title">
                        Выберите здание
                    </h3>
                    
                    {buildingTypes.map((building) => (
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
                    ))}
                    
                    <Button 
                        onClick={closeBuyMenu} 
                        text='Закрыть'
                        className="buy-menu-close-button"
                    />
                </div>
            </div>
        )}
    </div>
    );
};

export default UI;