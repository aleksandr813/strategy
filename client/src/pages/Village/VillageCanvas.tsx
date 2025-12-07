import React, { useEffect, useContext } from 'react';
import { GameContext } from '../../App';
import { TPoint } from '../../config';
import CONFIG from '../../config';
import GAMECONFIG from '../../game/gameConfig';
import { Canvas, useCanvas } from '../../services/canvas';
import Allocation from '../../services/canvas/Allocation';
import useSprites from '../../hooks/useSprites';
import Unit from '../../game/entities/Unit';
import Building from '../../game/entities/Building';
import villageBackground from '../../assets/img/background/villageBackground.png';

import "./Village.scss";

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;

// Константы для ограничения масштабирования
const MIN_ZOOM = 1; // Минимальный размер окна (1 клетка)
const MAX_ZOOM = 45; // Максимальный размер окна (всё поле видно)
const ZOOM_SPEED = 0.1; // Скорость зума
const ZOOM_THRESHOLD = 0.1; // Порог для предотвращения микро-корректировок

// Размеры игрового поля (должны совпадать с размерами фона)
const GAME_FIELD_WIDTH = 87;
const GAME_FIELD_HEIGHT = 29;

const VillageCanvas: React.FC = () => {
    const { WINDOW } = CONFIG;
    const game = useContext(GameContext);
    const village = game.getVillage();

    const background = new Image();
    background.src = villageBackground;

    let canvas: Canvas | null = null;
    const CanvasRef = useCanvas(render);

    const setCanvasSize = (canvasInstance: Canvas | null) => {
        if (canvasInstance) {
            canvasInstance.WIDTH = window.innerWidth;
            canvasInstance.HEIGHT = window.innerHeight;
            canvasInstance.canvas.width = window.innerWidth;
            canvasInstance.canvas.height = window.innerHeight;
            render(0);
        }
    };

    const allocation = new Allocation();
    const [[spritesImage], getSprite] = useSprites();

    let mouseDownPosition: TPoint | null = null;
    let mouseDownTime = 0;
    let wasDragging = false;
    let isMiddleMouseDragging = false;
    let middleMouseStartScreenPosition: TPoint | null = null;
    let windowStartPosition: { LEFT: number, TOP: number } | null = null;


    const clampCameraPosition = () => {

        const maxLeft = Math.max(0, GAME_FIELD_WIDTH - WINDOW.WIDTH);
        const maxTop = Math.max(0, GAME_FIELD_HEIGHT - WINDOW.HEIGHT);


        if (WINDOW.WIDTH >= GAME_FIELD_WIDTH) {
            WINDOW.LEFT = (GAME_FIELD_WIDTH - WINDOW.WIDTH) / 2;
        } else {
            WINDOW.LEFT = Math.max(0, Math.min(WINDOW.LEFT, maxLeft));
        }

        if (WINDOW.HEIGHT >= GAME_FIELD_HEIGHT) {
            WINDOW.TOP = (GAME_FIELD_HEIGHT - WINDOW.HEIGHT) / 2;
        } else {
            WINDOW.TOP = Math.max(0, Math.min(WINDOW.TOP, maxTop));
        }
    };

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

    const drawSprites = (canvas: Canvas, item: Unit | Building, coords: TPoint[]) => {
        item.sprites.forEach((sprite, i) => {
            const spriteData = getSprite(sprite);
            canvas.spriteFull(spritesImage, coords[i].x, coords[i].y, spriteData[0], spriteData[1], spriteData[2]);
        });
    };

    const drawUnits = (canvas: Canvas, units: Unit[]) => {
        units.forEach((unit) => {
            drawSprites(canvas, unit, [unit.coords]);

            let isSelected = unit.isSelected;
            if (allocation.isSelectingStatus) {
                isSelected = allocation.isUnitInSelection(unit);
            }

            if (isSelected) {
                drawRect(canvas, unit.coords.x, unit.coords.y, 1, 1, 'rgba(0, 255, 0, 0.5)');
            }

            if (unit.hp < unit.maxHp) {
                drawHPBar(canvas, unit.coords.x, unit.coords.y - 0.5, 0.8, 0.1, unit.hp, unit.maxHp);
            }
        });
    };

    const drawBuildings = (canvas: Canvas, buildings: Building[]) => {
        buildings.forEach((building) => {
            drawSprites(canvas, building, building.coords);
            if (building.hp < building.maxHp) {
                drawHPBar(canvas, building.coords[0].x, building.coords[0].y - 0.5, building.size, 0.2, building.hp, building.maxHp);
            }
        });
    };

    const drawBuildingPreview = (canvas: Canvas) => {
        const previewData = village.getScene().buildingPreview.getRenderData();
        if (!previewData) return;
        const { gridPosition, canPlace, size } = previewData;
        const color = canPlace ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
        drawRect(canvas, gridPosition.x, gridPosition.y, size, size, color);
        canvas.contextV.strokeStyle = canPlace ? '#00FF00' : '#FF0000';
        canvas.contextV.lineWidth = size;
        canvas.contextV.strokeRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(size), canvas.dec(size));
    };

    const drawUnitPreview = (canvas: Canvas) => {
        const previewData = village.getScene().unitPreview.getRenderData();
        if (!previewData) return;
        const { gridPosition, canPlace } = previewData;
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
        //canvas.drawFPS(String(FPS), GREEN);
        canvas.render();
    }

    const mouseDown = (x: number, y: number) => {
        mouseDownPosition = { x, y };
        mouseDownTime = Date.now();
        wasDragging = false;

        if (village.getScene().buildingPreview.isActiveStatus() || village.getScene().unitPreview.isActiveStatus()) return;

        allocation.start(x, y);
    };

    const mouseMove = (x: number, y: number, screenX?: number, screenY?: number) => {
        const { buildingPreview, unitPreview, units, buildings } = village.getScene();
        const matrix = village.getVillageMatrix(units, buildings);

        if (buildingPreview.isActiveStatus()) {
            buildingPreview.update(x, y, matrix);
        } else if (unitPreview.isActiveStatus()) {
            unitPreview.update(x, y, matrix);
        } else {
            allocation.update(x, y);
        }

        if (isMiddleMouseDragging && middleMouseStartScreenPosition && windowStartPosition && canvas && screenX !== undefined && screenY !== undefined) {

            const deltaX = (screenX - middleMouseStartScreenPosition.x) / canvas.WIDTH * WINDOW.WIDTH;
            const deltaY = (screenY - middleMouseStartScreenPosition.y) / canvas.HEIGHT * WINDOW.HEIGHT;


            WINDOW.LEFT = windowStartPosition.LEFT - deltaX;
            WINDOW.TOP = windowStartPosition.TOP - deltaY;


            clampCameraPosition();
        }
    };

    const handleClick = async (x: number, y: number) => {
        if (!village) return;

        const { buildingPreview, unitPreview } = village.getScene();

        if (buildingPreview.isActiveStatus()) {
            await village.handleBuildingPlacement();
        } else if (unitPreview.isActiveStatus()) {
            await village.handleUnitPlacement();
        } else {
            village.handleBuildingClick(x, y);

            if (!allocation.isSelectingStatus) {
                village.moveUnits({ x, y }, game['server']);
            }
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
            wasDragging = false;
            allocation.cancel();
            handleClick(x, y);
        }

        mouseDownPosition = null;
        mouseDownTime = 0;
    };

    const mouseClick = async (x: number, y: number) => {
        if (!village || wasDragging) return;

        const { buildingPreview, unitPreview, units } = village.getScene();

        if (buildingPreview.isActiveStatus()) {
            await village.handleBuildingPlacement();
        } else if (unitPreview.isActiveStatus()) {
            await village.handleUnitPlacement();
        } else {
            const clickedUnit = village.handleUnitClick(x, y);
            if (clickedUnit) {
                return;
            }

            village.handleBuildingClick(x, y);
        }

        if (!allocation.isSelectingStatus) {
            const hasSelectedUnits = units.some(u => u.isSelected);

            if (hasSelectedUnits) {
                village.moveUnits({ x, y }, game['server']);
            } else {
                village.selectUnit(null);
            }
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!village) return;
        const { buildingPreview, unitPreview, units } = village.getScene();

        if (buildingPreview.isActiveStatus()) {
            buildingPreview.deactivate();
            console.log('Размещение здания отменено');
        } else if (unitPreview.isActiveStatus()) {
            unitPreview.deactivate();
            console.log('Размещение юнита отменено');
        } else {
            allocation.clearSelection(units);
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

        const zoomIn = delta > 0;

        let newWidth = WINDOW.WIDTH;
        let newHeight = WINDOW.HEIGHT;

        if (zoomIn) {

            newWidth *= (1 + ZOOM_SPEED);
            newHeight *= (1 + ZOOM_SPEED);



            if (newHeight > MAX_ZOOM + ZOOM_THRESHOLD) {
                newHeight = MAX_ZOOM;
                newWidth = newHeight * (WINDOW.WIDTH / WINDOW.HEIGHT);
            }
        } else {

            newWidth *= (1 - ZOOM_SPEED);
            newHeight *= (1 - ZOOM_SPEED);


            if (newHeight < MIN_ZOOM - ZOOM_THRESHOLD) {
                newHeight = MIN_ZOOM;
                newWidth = newHeight * (WINDOW.WIDTH / WINDOW.HEIGHT);

            }
        }


        const oldWidth = WINDOW.WIDTH;
        const oldHeight = WINDOW.HEIGHT;


        WINDOW.WIDTH = newWidth;
        WINDOW.HEIGHT = newHeight;


        const relativeX = (x - WINDOW.LEFT) / oldWidth;
        const relativeY = (y - WINDOW.TOP) / oldHeight;
        WINDOW.LEFT = x - relativeX * WINDOW.WIDTH;
        WINDOW.TOP = y - relativeY * WINDOW.HEIGHT;

        clampCameraPosition();
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
        if (event.key !== 'Escape') return;

        const scene = village.getScene();
        scene.buildingPreview.deactivate();
        scene.unitPreview.deactivate();
    };

    const INITIAL_WINDOW_WIDTH = CONFIG.WINDOW.WIDTH;
    const INITIAL_WINDOW_HEIGHT = CONFIG.WINDOW.HEIGHT;
    const INITIAL_WINDOW_LEFT = CONFIG.WINDOW.LEFT;
    const INITIAL_WINDOW_TOP = CONFIG.WINDOW.TOP;

    useEffect(() => {
        canvas = CanvasRef({
            parentId: GAME_FIELD,
            WIDTH: window.innerWidth,
            HEIGHT: window.innerHeight,
            WINDOW,
            callbacks: {
                mouseMove, mouseDown, mouseUp, mouseRightClickDown, mouseClick,
                mouseLeave, mouseWheel, mouseMiddleDown, mouseMiddleUp, keyDown
            },
        });

        const handleResize = () => {
            setCanvasSize(canvas);
        };

        window.addEventListener('resize', handleResize);

        canvas.context.imageSmoothingEnabled = false;
        canvas.contextV.imageSmoothingEnabled = false;

        village.loadBuildings();
        village.loadUnits();

        clampCameraPosition();

        return () => {
            if (WINDOW.WIDTH !== INITIAL_WINDOW_WIDTH) {
                WINDOW.WIDTH = INITIAL_WINDOW_WIDTH;
                WINDOW.HEIGHT = INITIAL_WINDOW_HEIGHT;
                WINDOW.LEFT = INITIAL_WINDOW_LEFT;
                WINDOW.TOP = INITIAL_WINDOW_TOP;
            }

            window.removeEventListener('resize', handleResize);

            village?.destructor();
            //canvas?.destructor();
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