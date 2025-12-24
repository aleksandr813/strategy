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
import tableBackground from '../../assets/img/background/tableBackground.png'

import "./Village.scss";

const GAME_FIELD = 'game-field';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;
const BORDER_PADDING = GAMECONFIG.BORDER_PADDING;

const MIN_ZOOM = GAMECONFIG.MIN_ZOOM;
const MAX_ZOOM = GAMECONFIG.MAX_ZOOM;
const ZOOM_FACTOR = GAMECONFIG.ZOOM_FACTOR;

const GAME_FIELD_WIDTH = GAMECONFIG.GRID_WIDTH;
const GAME_FIELD_HEIGHT = GAMECONFIG.GRID_HEIGHT;

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

    const clampCamera = () => {
        // границы с учётом отступа
        const maxLeft = Math.max(0, GAME_FIELD_WIDTH - WINDOW.WIDTH + BORDER_PADDING);
        const maxTop = Math.max(0, GAME_FIELD_HEIGHT - WINDOW.HEIGHT + BORDER_PADDING);
        
        // минимальные значения
        const minLeft = -BORDER_PADDING;
        const minTop = -BORDER_PADDING;
        
        WINDOW.LEFT = Math.max(minLeft, Math.min(WINDOW.LEFT, maxLeft));
        WINDOW.TOP = Math.max(minTop, Math.min(WINDOW.TOP, maxTop));
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
            const currentSpriteId = unit.getCurrentSpriteId();
            const spriteData = getSprite(currentSpriteId); 
            canvas.spriteFull(
                spritesImage, 
                unit.coords.x, 
                unit.coords.y, 
                spriteData[0], 
                spriteData[1], 
                spriteData[2]
            );
            
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
            
            clampCamera();
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
        
        const zoomAmount = delta > 0 ? 1 + ZOOM_FACTOR : 1 - ZOOM_FACTOR;
        const newWidth = WINDOW.WIDTH * zoomAmount;
        const newHeight = WINDOW.HEIGHT * zoomAmount;
        
        if (newHeight < MIN_ZOOM || newHeight > MAX_ZOOM) return;
        
        const scale = newWidth / WINDOW.WIDTH;
        WINDOW.LEFT = x - (x - WINDOW.LEFT) * scale;
        WINDOW.TOP = y - (y - WINDOW.TOP) * scale;
        
        WINDOW.WIDTH = newWidth;
        WINDOW.HEIGHT = newHeight;
        
        clampCamera();
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

        clampCamera();

        return () => {
            if (WINDOW.WIDTH !== INITIAL_WINDOW_WIDTH) {
                WINDOW.WIDTH = INITIAL_WINDOW_WIDTH;
                WINDOW.HEIGHT = INITIAL_WINDOW_HEIGHT;
                WINDOW.LEFT = INITIAL_WINDOW_LEFT;
                WINDOW.TOP = INITIAL_WINDOW_TOP;
            }

            window.removeEventListener('resize', handleResize);

            village?.destructor();
            canvas = null;
        };
    }, []);

    return (
        <div className='VillageCanvas'
        style={{
                backgroundImage: `url(${tableBackground})`,
                backgroundRepeat: 'repeat',
                backgroundPosition: 'center',
                imageRendering: 'pixelated' 
            }}>
            <div id={GAME_FIELD} className={GAME_FIELD}></div>
        </div>
    );
};

export default VillageCanvas;