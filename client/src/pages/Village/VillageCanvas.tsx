import React, { useEffect, useContext } from 'react';
import CONFIG from '../../config';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units/Unit';
import Building from '../../game/Buildings/Building';
import Allocation from './UI/Allocation';
import { VillageContext, ServerContext } from '../../App';
import { TPoint } from '../../config';
import VillageManager from './villageDataManager';
import villageBackground from '../../assets/img/background/villageBackground.png'

import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;

let zoomFactor = 1;

const VillageCanvas: React.FC = () => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;

    const village = useContext(VillageContext)
    const server = useContext(ServerContext)

    const background = new Image()
    background.src = villageBackground

    let canvas: Canvas | null = null;
    const Canvas = useCanvas(render);
    
    const allocation = new Allocation();

    let mouseDownPosition: TPoint | null = null;
    let mouseDownTime: number = 0;
    let wasDragging: boolean = false;
    let isMiddleMouseDragging: boolean = false;
    let middleMouseStartScreenPosition: TPoint | null = null;
    let windowStartPosition: { LEFT: number, TOP: number } | null = null;
    
    const [[spritesImage], getSprite] = useSprites();

    function drawHPBar(
        canvas: Canvas,
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        currentHp: number,
        maxHp: number
    ): void {
        if (currentHp >= maxHp) return;

        const ctx = canvas.contextV;
        const hpRatio = currentHp / maxHp;
        
        ctx.fillStyle = "#A00000";
        ctx.fillRect(canvas.xs(x), canvas.ys(y), canvas.dec(width), canvas.dec(height));
        
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(canvas.xs(x), canvas.ys(y), canvas.dec(width * hpRatio), canvas.dec(height));
    }

    function drawBackground(canvas:Canvas):void {
            if (background.complete) {
                canvas.contextV.drawImage(
                    background,
                    canvas.xs(0),
                    canvas.ys(0),
                    canvas.dec(87),
                    canvas.dec(29) 
                );
            }
    }

    function drawUnits(canvas: Canvas, units: Unit[]): void {
        const ctx = canvas.contextV;

        units.forEach((unit) => {
            unit.sprites.forEach((sprite, i) => {
            const spriteData = getSprite(sprite);
            canvas.spriteFull(spritesImage, unit.cords.x, unit.cords.y, spriteData[0], spriteData[1], spriteData[2]);
        });
            
            const isSelected = allocation.isSelectingStatus 
                ? allocation.isUnitInSelection(unit)
                : unit.isSelected;
                
            if (isSelected) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.fillRect(canvas.xs(unit.cords.x), canvas.ys(unit.cords.y), canvas.dec(1), canvas.dec(1));
            }

            if (unit.hp < unit.maxHp) {
                drawHPBar(canvas, 
                    unit.cords.x, 
                    unit.cords.y - 0.5, 
                    0.8, 
                    0.1, 
                    unit.hp, 
                    unit.maxHp
                );
            }
        });
    }

    function drawBuildings(canvas: Canvas, buildings: Building[]): void {
        buildings.forEach((building) => {
            building.sprites.forEach((sprite, i) => {
                const spriteData = getSprite(sprite);
                canvas.spriteFull(spritesImage, building.cords[i].x, building.cords[i].y, spriteData[0], spriteData[1], spriteData[2]);
            });

            if (building.hp < building.maxHp) {
                drawHPBar(canvas,
                    building.cords[0].x,
                    building.cords[0].y - 0.5,
                    building.size,
                    0.2,
                    building.hp,
                    building.maxHp
                );
            }
        });
    }

    function drawBuildingPreview(canvas: Canvas): void {
        const previewData = village.getScene().buildingPreview.getRenderData();
        if (!previewData) return;

        const { gridPosition, canPlace } = previewData;
        const ctx = canvas.contextV;
        const color = canPlace ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
        
        ctx.fillStyle = color;
        ctx.fillRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(2), canvas.dec(2));
        
        ctx.strokeStyle = canPlace ? '#00FF00' : '#FF0000';
        ctx.lineWidth = 2;
        ctx.fillRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(2), canvas.dec(2));
    }

    function drawSelectionRect(canvas: Canvas): void {
        if (!allocation.isSelectingStatus) return;

        const rect = allocation.getSelectionRect();
        if (rect) {
            canvas.contextV.fillStyle = "rgba(0, 255, 0, 0.5)";
            canvas.contextV.fillRect(canvas.xs(rect.x), canvas.ys(rect.y), canvas.dec(rect.width), canvas.dec(rect.height));
        }
    }

    function render(FPS: number): void {
        if (canvas && village) {
            canvas.clear();

            drawBackground(canvas);

            const { units, buildings } = village.getScene();

            drawUnits(canvas, units);
            drawBuildings(canvas, buildings);
            drawSelectionRect(canvas);
            drawBuildingPreview(canvas);

            canvas.text(WINDOW.LEFT + 0.2, WINDOW.TOP + 0.5, String(FPS), GREEN);
            canvas.render();
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
        if (village.getScene().buildingPreview.isActiveStatus() && village) {
            const { units, buildings } = village.getScene();
            const matrix = village.getVillageMatrix(units, buildings);
            village.getScene().buildingPreview.update(x, y, matrix);
        } else {
            allocation.update(x, y);
        }

        // Переиещение камеры средней кнопкой мыши
        if (isMiddleMouseDragging && middleMouseStartScreenPosition && windowStartPosition && canvas && screenX !== undefined && screenY !== undefined) {
            const deltaScreenX = screenX - middleMouseStartScreenPosition.x;
            const deltaScreenY = screenY - middleMouseStartScreenPosition.y;
            
            const worldDeltaX = (deltaScreenX / canvas.WIDTH) * WINDOW.WIDTH;
            const worldDeltaY = (deltaScreenY / canvas.HEIGHT) * WINDOW.HEIGHT;
            
            WINDOW.LEFT = windowStartPosition.LEFT - worldDeltaX;
            WINDOW.TOP = windowStartPosition.TOP - worldDeltaY;
        }

    };

    const mouseUp = (x: number, y: number) => {
        if (!village) return;

        if (mouseDownPosition) {
            const distance = Math.sqrt(
                Math.pow(x - mouseDownPosition.x, 2) + Math.pow(y - mouseDownPosition.y, 2)
            );
            const timeElapsed = Date.now() - mouseDownTime;

            if (distance > DRAG_THRESHOLD || timeElapsed > TIME_THRESHOLD) {
                wasDragging = true;
                allocation.end(village.getScene().units);
            } else {
                allocation.cancel();
            }
        }
        
        mouseDownPosition = null;
        mouseDownTime = 0;
    };

    const mouseClick = async (x: number, y: number) => {
        if (!village || wasDragging) return;

        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        const { buildings } = village.getScene();

        for (const building of buildings) {
            const [bx, by] = [building.cords[0].x, building.cords[0].y];
            if (gridX >= bx && gridX < bx + 2 && gridY >= by && gridY < by + 2) {
                building.takeDamage(10);
                return;
            }
        }

        if (!allocation.isSelectingStatus) {
            village.moveUnits({ x, y });
            console.log('move units to', { x, y });
        }

        // Режим размещения здания
        if (village.getScene().buildingPreview.isActiveStatus()) {
            const newBuilding = village.getScene().buildingPreview.tryPlace();
            if (newBuilding) {
                const typeId = village.getScene().buildingPreview.getBuildingTypeId();
                const pos = village.getScene().buildingPreview.getPlacementPosition();

                try {
                    const result = await server.buyBuilding(typeId, pos.x, pos.y);

                    console.log('Результат buyBuilding:', result);

                    if (result && !result.error) {
                        village.addBuilding(newBuilding);
                    } else {
                        console.error('Ошибка при покупке здания:', result?.error || result);
                        village.getScene().buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
                    }
                } catch (error) {
                    console.error('Ошибка запроса:', error);
                    village.getScene().buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
                }
            }
            return;
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!village) return;

        if (village.getScene().buildingPreview.isActiveStatus()) {
            village.getScene().buildingPreview.deactivate();
            console.log('Размещение здания отменено');
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

        zoomFactor = delta > 0 ? 1.1 : 0.9;
        
        const worldX = x;
        const worldY = y;
        
        //Зум
        const oldWidth = WINDOW.WIDTH;
        const oldHeight = WINDOW.HEIGHT;
        
        WINDOW.WIDTH *= zoomFactor;
        WINDOW.HEIGHT *= zoomFactor;

        const relativeX = (worldX - WINDOW.LEFT) / oldWidth;
        const relativeY = (worldY - WINDOW.TOP) / oldHeight;

        WINDOW.LEFT = worldX - relativeX * WINDOW.WIDTH;
        WINDOW.TOP = worldY - relativeY * WINDOW.HEIGHT;

        
    };

    const mouseMiddleDown = (x: number, y: number, screenX?: number, screenY?: number) => {
        isMiddleMouseDragging = true;
        middleMouseStartScreenPosition = screenX !== undefined && screenY !== undefined 
            ? { x: screenX, y: screenY } 
            : null;
        windowStartPosition = { LEFT: WINDOW.LEFT, TOP: WINDOW.TOP };
    };

    const mouseMiddleUp = (x: number, y: number) => {
        isMiddleMouseDragging = false;
        middleMouseStartScreenPosition = null;
        windowStartPosition = null;
    };

    const keyDown = (event: KeyboardEvent) => {
        if (village.getScene().buildingPreview.isActiveStatus()) {
            village.getScene().buildingPreview.deactivate();
            console.log('Размещение здания отменено (ESC)');
        }
    };

    useEffect(() => {
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
                mouseLeave,
                mouseWheel,
                mouseMiddleDown,
                mouseMiddleUp,
                keyDown,
            },
        });

        (async () => {
        village.loadBuildings()
        village.setBuildings(village.getScene().buildings);
    })();

        (async () => {
        village.loadUnits()
        village.setUnits(village.getScene().units);
    })();


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