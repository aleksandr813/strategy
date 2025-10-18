import React, { useEffect, useRef } from 'react';
import CONFIG from '../../config';
import Game from '../../game/Game';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units/Unit';
import Building from '../../game/Buildings/Building';
import Allocation from './UI/Allocation';
import BuildingPreview from './UI/BuildingPreview';
import { TPoint } from '../../config';

import "./Village.scss"

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;

const VillageCanvas: React.FC = () => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;
    
    let game: Game | null = null;
    let canvas: Canvas | null = null;
    const Canvas = useCanvas(render);
    
    const allocationRef = useRef(new Allocation());
    const buildingPreviewRef = useRef(new BuildingPreview());
    const mouseStateRef = useRef({
        downPosition: null as TPoint | null,
        downTime: 0,
        wasDragging: false
    });
    
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
        const allocation = allocationRef.current;
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
            building.sprites.forEach((sprite, i) => {
                const spriteData = getSprite(sprite);
                canvas.spriteFull(spritesImage, building.cords[i].x, building.cords[i].y, spriteData[0], spriteData[1], spriteData[2]);
            });

            if (building.hp < building.MAX_HP) {
                drawHPBar(canvas,
                    building.cords[0].x,
                    building.cords[0].y - 0.5,
                    building.size,
                    0.2,
                    building.hp,
                    building.MAX_HP
                );
            }
        });
    }

    function drawBuildingPreview(canvas: Canvas): void {
        const previewData = buildingPreviewRef.current.getRenderData();
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
        const allocation = allocationRef.current;
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
        if (buildingPreviewRef.current.isActiveStatus()) return;

        mouseStateRef.current = {
            downPosition: { x, y },
            downTime: Date.now(),
            wasDragging: false
        };
        allocationRef.current.start(x, y);
    };

    const mouseMove = (x: number, y: number) => {
        const buildingPreview = buildingPreviewRef.current;

        if (buildingPreview.isActiveStatus() && game) {
            const { units, buildings } = game.getScene();
            const matrix = game.getVillageMatrix(units, buildings);
            buildingPreview.update(x, y, matrix);
        } else {
            allocationRef.current.update(x, y);
        }
    };

    const mouseUp = (x: number, y: number) => {
        if (!game) return;

        const mouseState = mouseStateRef.current;
        const { downPosition, downTime } = mouseState;
        
        if (downPosition) {
            const distance = Math.sqrt(
                Math.pow(x - downPosition.x, 2) + Math.pow(y - downPosition.y, 2)
            );
            const timeElapsed = Date.now() - downTime;

            if (distance > DRAG_THRESHOLD || timeElapsed > TIME_THRESHOLD) {
                mouseState.wasDragging = true;
                allocationRef.current.end(game.getScene().units);
            } else {
                allocationRef.current.cancel();
            }
        }
        
        mouseState.downPosition = null;
        mouseState.downTime = 0;
    };

    const mouseClick = (x: number, y: number) => {
        if (!game || mouseStateRef.current.wasDragging) return;

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

        if (!allocationRef.current.isSelectingStatus) {
            game.moveUnits({ x, y });
            console.log('move units to', { x, y });
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!game) return;

        const buildingPreview = buildingPreviewRef.current;
        
        if (buildingPreview.isActiveStatus()) {
            buildingPreview.deactivate();
            console.log('Размещение здания отменено');
        } else {
            allocationRef.current.clearSelection(game.getScene().units);
            console.log('Выделение снято');
        }
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
        };
    });

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && buildingPreviewRef.current.isActiveStatus()) {
                buildingPreviewRef.current.deactivate();
                console.log('Размещение здания отменено (ESC)');
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    });

    return (
        <div className='VillageCanvas'>
            <div id={GAME_FIELD} className={GAME_FIELD}></div>
        </div>
    );
};

export default VillageCanvas;