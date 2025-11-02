import React, { useEffect, useContext } from 'react';
import CONFIG from '../../config';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Entities/Unit';
import Building from '../../game/Entities/Building';
import Allocation from '../../services/canvas/Allocation';
import { GameContext } from '../../App';
import { TPoint } from '../../config';
import villageBackground from '../../assets/img/background/villageBackground.png';

import "./Village.scss";

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;

let zoomFactor = 1;

const VillageCanvas: React.FC = () => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;
    const game = useContext(GameContext);
    const village = game.getVillage();
    
    const background = new Image();
    background.src = villageBackground;

    let canvas: Canvas | null = null;
    const Canvas = useCanvas(render);
    const allocation = new Allocation();
    const [[spritesImage], getSprite] = useSprites();

    let mouseDownPosition: TPoint | null = null;
    let mouseDownTime = 0;
    let wasDragging = false;
    let isMiddleMouseDragging = false;
    let middleMouseStartScreenPosition: TPoint | null = null;
    let windowStartPosition: { LEFT: number, TOP: number } | null = null;

    const drawRect = (canvas: Canvas, x: number, y: number, width: number, height: number, fillStyle: string) => {
        canvas.contextV.fillStyle = fillStyle;
        canvas.contextV.fillRect(canvas.xs(x), canvas.ys(y), canvas.dec(width), canvas.dec(height));
    };

    const drawHPBar = (canvas: Canvas, x: number, y: number, width: number, height: number, currentHp: number, maxHp: number) => {
        if (currentHp >= maxHp) return;
        const hpRatio = currentHp / maxHp;
        drawRect(canvas, x, y, width, height, "#A00000");
        drawRect(canvas, x, y, width * hpRatio, height, "#00FF00");
    };

    const drawSprites = (canvas: Canvas, item: Unit | Building, cords: TPoint[]) => {
        item.sprites.forEach((sprite, i) => {
            const spriteData = getSprite(sprite);
            canvas.spriteFull(spritesImage, cords[i].x, cords[i].y, spriteData[0], spriteData[1], spriteData[2]);
        });
    };

    const drawUnits = (canvas: Canvas, units: Unit[]) => {
        units.forEach((unit) => {
            drawSprites(canvas, unit, [unit.cords]);
            
            let isSelected = unit.isSelected;
            if (allocation.isSelectingStatus) {
                isSelected = allocation.isUnitInSelection(unit);
            }
                
            if (isSelected) {
                drawRect(canvas, unit.cords.x, unit.cords.y, 1, 1, 'rgba(0, 255, 0, 0.5)');
            }

            if (unit.hp < unit.maxHp) {
                drawHPBar(canvas, unit.cords.x, unit.cords.y - 0.5, 0.8, 0.1, unit.hp, unit.maxHp);
            }
        });
    };

    const drawBuildings = (canvas: Canvas, buildings: Building[]) => {
        buildings.forEach((building) => {
            drawSprites(canvas, building, building.cords);
            if (building.hp < building.maxHp) {
                drawHPBar(canvas, building.cords[0].x, building.cords[0].y - 0.5, building.size, 0.2, building.hp, building.maxHp);
            }
        });
    };

    const drawBuildingPreview = (canvas: Canvas) => {
        const previewData = village.getScene().buildingPreview.getRenderData();
        if (!previewData) return;
        const { gridPosition, canPlace } = previewData;
        const color = canPlace ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
        drawRect(canvas, gridPosition.x, gridPosition.y, 2, 2, color);
        canvas.contextV.strokeStyle = canPlace ? '#00FF00' : '#FF0000';
        canvas.contextV.lineWidth = 2;
        canvas.contextV.strokeRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(2), canvas.dec(2));
    };

    const drawUnitPreview = (canvas: Canvas) => {
        const previewData = village.getScene().unitPreview.getRenderData();
        if (!previewData) return;
        const { gridPosition, canPlace} = previewData;
        const color = canPlace ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
        drawRect(canvas, gridPosition.x, gridPosition.y, 1, 1, color);
        canvas.contextV.strokeStyle = canPlace ? '#00FF00' : '#FF0000';
        canvas.contextV.lineWidth = 1;
        canvas.contextV.strokeRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(1), canvas.dec(1));
    }

    const drawSelectionRect = (canvas: Canvas) => {
        if (!allocation.isSelectingStatus) return;
        const rect = allocation.getSelectionRect();
        if (rect) {
            canvas.contextV.fillStyle = "rgba(0, 255, 0, 0.5)";
            canvas.contextV.fillRect(canvas.xs(rect.x), canvas.ys(rect.y), canvas.dec(rect.width), canvas.dec(rect.height));
        }
    };

    function render(FPS: number) {
        if (!canvas || !village) return;
        canvas.clear();
        if (background.complete) {
            canvas.contextV.drawImage(background, canvas.xs(0), canvas.ys(0), canvas.dec(87), canvas.dec(29));
        }
        const { units, buildings } = village.getScene();
        drawUnits(canvas, units);
        drawBuildings(canvas, buildings);
        drawSelectionRect(canvas);
        drawBuildingPreview(canvas);
        drawUnitPreview(canvas);
        canvas.drawFPS(String(FPS), GREEN);
        canvas.render();
    }

    const handleBuildingClick = async (x: number, y: number) => {
        const preview = village.getScene().buildingPreview;
        const newBuilding = preview.tryPlace();
        if (!newBuilding) return;
        
        const typeId = preview.getBuildingTypeId();
        const pos = preview.getPlacementPosition();

        try {
            // Используем server из game
            const result = await game['server'].buyBuilding(typeId, pos.x, pos.y);
            if (result && !result.error) {
                village.addBuilding(newBuilding);
            } 
            else {
                console.error('Ошибка при покупке здания:', result?.error || result);
                preview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
            preview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
        }
    };

    const handleUnitClick = async (x: number, y: number) => {
        const preview = village.getScene().unitPreview;
        const newUnit = preview.tryPlace();
        if (!newUnit) return;

        const typeId = preview.getUnitTypeId();
        const pos = preview.getPlacementPosition();

        try {
            const result = await game['server'].buyUnit(typeId, pos.x, pos.y);
            if (result && !result.error) {
                village.addUnit(newUnit);
            } else {
                console.error('Ошибка размещения юнита:', result?.error || result);
                preview.activate(newUnit.sprites[0].toString(), typeId, newUnit.hp);
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
            preview.activate(newUnit.sprites[0].toString(), typeId, newUnit.hp);
        }
    }

    const mouseDown = (x: number, y: number) => {
        if (village.getScene().buildingPreview.isActiveStatus()) return;
        mouseDownPosition = { x, y };
        mouseDownTime = Date.now();
        wasDragging = false;
        allocation.start(x, y);
    };

    const mouseMove = (x: number, y: number, screenX?: number, screenY?: number) => {
        const preview = village.getScene().buildingPreview;
        
        if (preview.isActiveStatus()) {
            const { units, buildings } = village.getScene();
            preview.update(x, y, village.getVillageMatrix(units, buildings));
        } else {
            allocation.update(x, y);
        }
        if (village.getScene().unitPreview.isActiveStatus() && village) {
            const {units, buildings} = village.getScene();
            const matrix = village.getVillageMatrix(units, buildings);
            village.getScene().unitPreview.update(x, y, matrix);
        }

        if (isMiddleMouseDragging && middleMouseStartScreenPosition && windowStartPosition && canvas && screenX !== undefined && screenY !== undefined) {
            const deltaX = (screenX - middleMouseStartScreenPosition.x) / canvas.WIDTH * WINDOW.WIDTH;
            const deltaY = (screenY - middleMouseStartScreenPosition.y) / canvas.HEIGHT * WINDOW.HEIGHT;
            WINDOW.LEFT = windowStartPosition.LEFT - deltaX;
            WINDOW.TOP = windowStartPosition.TOP - deltaY;
        }
    };

    const mouseUp = (x: number, y: number) => {
        if (!village || !mouseDownPosition) return;
        const distance = Math.hypot(x - mouseDownPosition.x, y - mouseDownPosition.y);
        const timeElapsed = Date.now() - mouseDownTime;

        if (distance > DRAG_THRESHOLD || timeElapsed > TIME_THRESHOLD) {
            wasDragging = true;
            allocation.end(village.getScene().units);
        } else {
            allocation.cancel();
        }
        mouseDownPosition = null;
        mouseDownTime = 0;
    };

    const mouseClick = async (x: number, y: number) => {
        if (!village || wasDragging) return;
        const gridX = Math.floor(x), gridY = Math.floor(y);
        const { buildings } = village.getScene();
        const clickedBuilding = buildings.find(b => {
            const [bx, by] = [b.cords[0].x, b.cords[0].y];
            return gridX >= bx && gridX < bx + 2 && gridY >= by && gridY < by + 2;
        }) || null;
        
        if (clickedBuilding) {
            console.log("Выбранное здание", clickedBuilding);
            clickedBuilding.takeDamage(10);
        }
        village.selectBuilding(clickedBuilding);

        if (!allocation.isSelectingStatus) {
            village.moveUnits({ x, y });
            console.log('move units to', { x, y });
        }

        if (village.getScene().buildingPreview.isActiveStatus()) {
            await handleBuildingClick(x, y);
        }

        if (village.getScene().unitPreview.isActiveStatus()) {
            await handleUnitClick(x, y);
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!village) return;
        const preview = village.getScene().buildingPreview;
        
        if (preview.isActiveStatus()) {
            preview.deactivate();
            console.log('Размещение здания отменено');
        }
        if (village.getScene().unitPreview.isActiveStatus()) {
            village.getScene().unitPreview.deactivate();
            console.log('Размещение юнита отменено');
        } else {
            allocation.clearSelection(village.getScene().units);
            console.log('Выделение снято');
        }
    };

    const mouseLeave = () => {
        console.log('Мышь покинула канвас');
        wasDragging = false;
        isMiddleMouseDragging = false;
        middleMouseStartScreenPosition = null;
        windowStartPosition = null;
        allocation.cancel();
    };

    const mouseWheel = (delta: number, x: number, y: number) => {
        if (!canvas) return;
        if (delta > 0) {
            zoomFactor = 1.1;
        } else {
            zoomFactor = 0.9;
        }
        const oldWidth = WINDOW.WIDTH, oldHeight = WINDOW.HEIGHT;
        WINDOW.WIDTH *= zoomFactor;
        WINDOW.HEIGHT *= zoomFactor;
        const relativeX = (x - WINDOW.LEFT) / oldWidth;
        const relativeY = (y - WINDOW.TOP) / oldHeight;
        WINDOW.LEFT = x - relativeX * WINDOW.WIDTH;
        WINDOW.TOP = y - relativeY * WINDOW.HEIGHT;
    };

    const mouseMiddleDown = (x: number, y: number, screenX?: number, screenY?: number) => {
        isMiddleMouseDragging = true;
        if (screenX !== undefined && screenY !== undefined) {
            middleMouseStartScreenPosition = { x: screenX, y: screenY };
        }
        windowStartPosition = { LEFT: WINDOW.LEFT, TOP: WINDOW.TOP };
    };

    const mouseMiddleUp = () => {
        isMiddleMouseDragging = false;
        middleMouseStartScreenPosition = null;
        windowStartPosition = null;
    };

    const keyDown = (event: KeyboardEvent) => {
        const preview = village.getScene().buildingPreview;
        if (preview.isActiveStatus()) {
            preview.deactivate();
            console.log('Размещение здания отменено (ESC)');
        }

        if (village.getScene().unitPreview.isActiveStatus()) {
            village.getScene().unitPreview.deactivate();
            console.log('Размещение юнита отменено (ESC)');
        }
    };

    useEffect(() => {
        canvas = Canvas({
            parentId: GAME_FIELD,
            WIDTH: WINDOW.WIDTH * SPRITE_SIZE,
            HEIGHT: WINDOW.HEIGHT * SPRITE_SIZE,
            WINDOW,
            callbacks: {
                mouseMove, mouseDown, mouseUp, mouseRightClickDown, mouseClick,
                mouseLeave, mouseWheel, mouseMiddleDown, mouseMiddleUp, keyDown
            },
        });

        canvas.context.imageSmoothingEnabled = false;
        canvas.contextV.imageSmoothingEnabled = false;

        village.loadBuildings();
        village.loadUnits();

        return () => {
            village?.destructor();
            canvas?.destructor();
            canvas = null;
        };
    }, []);

    return (
        <div className='VillageCanvas'>
            <div id={GAME_FIELD} className={GAME_FIELD}></div>
        </div>
    );
};

export default VillageCanvas;