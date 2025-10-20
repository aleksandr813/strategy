import React, { useEffect, useContext } from 'react';
import CONFIG from '../../config';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units/Unit';
import Building from '../../game/Buildings/Building';
import Allocation from './UI/Allocation';
import { GameContext, ServerContext } from '../../App';
import { TPoint } from '../../config';
import VillageManager from './villageDataManager';

import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;

const VillageCanvas: React.FC = () => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;

    const game = useContext(GameContext)
    const server = useContext(ServerContext)

    let canvas: Canvas | null = null;
    const Canvas = useCanvas(render);
    
    const allocation = new Allocation();

    let mouseDownPosition: TPoint | null = null;
    let mouseDownTime: number = 0;
    let wasDragging: boolean = false;
    
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

    function drawUnits(canvas: Canvas, units: Unit[]): void {
        const ctx = canvas.contextV;

        units.forEach((unit) => {
            const sprite = getSprite(unit.sprite);
            canvas.spriteFull(spritesImage, unit.cords.x, unit.cords.y, sprite[0], sprite[1], sprite[2]);
            
            const isSelected = allocation.isSelectingStatus 
                ? allocation.isUnitInSelection(unit)
                : unit.isSelected;
                
            if (isSelected) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.fillRect(canvas.xs(unit.cords.x), canvas.ys(unit.cords.y), canvas.dec(1), canvas.dec(1));
            }

            if (unit.hp < unit.maxHp) {
                drawHPBar(canvas, 
                    unit.cords.x + 0.1, 
                    unit.cords.y - 0.1, 
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
            console.log(`Building ID: ${building.id}, Sprites Array:`, building.sprites);
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
        const previewData = game.getScene().buildingPreview.getRenderData();
        if (!previewData) return;

        const { gridPosition, canPlace } = previewData;
        const ctx = canvas.contextV;
        const color = canPlace ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
        
        ctx.fillStyle = color;
        ctx.fillRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(2), canvas.dec(2));
        
        ctx.strokeStyle = canPlace ? '#00FF00' : '#FF0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(2), canvas.dec(2));
    }

    function drawSelectionRect(canvas: Canvas): void {
        if (!allocation.isSelectingStatus) return;

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

    function render(FPS: number): void {
        if (canvas && game) {
            console.log('Sprites Image Loaded:', spritesImage ? 'YES' : 'NO');
            canvas.clear();
            const { units, buildings } = game.getScene();

            drawUnits(canvas, units);
            drawBuildings(canvas, buildings);
            drawSelectionRect(canvas);
            drawBuildingPreview(canvas);

            canvas.text(WINDOW.LEFT + 0.2, WINDOW.TOP + 0.5, String(FPS), GREEN);
            canvas.render();
        }
    }

    const mouseDown = (x: number, y: number) => {
        if (game.getScene().buildingPreview.isActiveStatus()) return;

        mouseDownPosition = { x, y };
        mouseDownTime = Date.now();
        wasDragging = false;
        allocation.start(x, y);
    };

    const mouseMove = (x: number, y: number) => {
        if (game.getScene().buildingPreview.isActiveStatus() && game) {
            const { units, buildings } = game.getScene();
            const matrix = game.getVillageMatrix(units, buildings);
            game.getScene().buildingPreview.update(x, y, matrix);
        } else {
            allocation.update(x, y);
        }
    };

    const mouseUp = (x: number, y: number) => {
        if (!game) return;

        if (mouseDownPosition) {
            const distance = Math.sqrt(
                Math.pow(x - mouseDownPosition.x, 2) + Math.pow(y - mouseDownPosition.y, 2)
            );
            const timeElapsed = Date.now() - mouseDownTime;

            if (distance > DRAG_THRESHOLD || timeElapsed > TIME_THRESHOLD) {
                wasDragging = true;
                allocation.end(game.getScene().units);
            } else {
                allocation.cancel();
            }
        }
        
        mouseDownPosition = null;
        mouseDownTime = 0;
    };

    const mouseClick = async (x: number, y: number) => {
        if (!game || wasDragging) return;

        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        const { buildings } = game.getScene();

        for (const building of buildings) {
            const [bx, by] = [building.cords[0].x, building.cords[0].y];
            if (gridX >= bx && gridX < bx + 2 && gridY >= by && gridY < by + 2) {
                building.takeDamage(10);
                console.log(`Building HP: ${building.hp}`);
                return;
            }
        }

        if (!allocation.isSelectingStatus) {
            game.moveUnits({ x, y });
            console.log('move units to', { x, y });
        }

        // Режим размещения здания
        if (game.getScene().buildingPreview.isActiveStatus()) {
            const newBuilding = game.getScene().buildingPreview.tryPlace();
            if (newBuilding) {
                const typeId = game.getScene().buildingPreview.getBuildingTypeId();
                const pos = game.getScene().buildingPreview.getPlacementPosition();

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
                        game.getScene().buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
                    }
                } catch (error) {
                    console.error('Ошибка запроса:', error);
                    game.getScene().buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
                }
            }
            return;
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!game) return;

        if (game.getScene().buildingPreview.isActiveStatus()) {
            game.getScene().buildingPreview.deactivate();
            console.log('Размещение здания отменено');
        } else {
            allocation.clearSelection(game.getScene().units);
            console.log('Выделение снято');
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
            },
        });

        (async () => {
        await game.loadBuildings(server);
        game.getGame().setBuildings(game.getScene().buildings);
    })();

        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && game.getScene().buildingPreview.isActiveStatus()) {
                game.getScene().buildingPreview.deactivate();
                console.log('Размещение здания отменено (ESC)');
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            game?.destructor();
            canvas?.destructor();
            canvas = null;
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);

    return (
        <div className='VillageCanvas'>
            <div id={GAME_FIELD} className={GAME_FIELD}></div>
        </div>
    );
};

export default VillageCanvas;