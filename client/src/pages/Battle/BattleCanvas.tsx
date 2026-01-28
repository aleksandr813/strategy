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

import "./Battle.scss";

const GAME_FIELD = 'game-field';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;
const BORDER_PADDING = GAMECONFIG.BORDER_PADDING;

const MIN_ZOOM = GAMECONFIG.MIN_ZOOM;
const MAX_ZOOM = GAMECONFIG.MAX_ZOOM;
const ZOOM_FACTOR = GAMECONFIG.ZOOM_FACTOR;

const GAME_FIELD_WIDTH = GAMECONFIG.GRID_WIDTH;
const GAME_FIELD_HEIGHT = GAMECONFIG.GRID_HEIGHT;

const BattleCanvas: React.FC = () => {
    const { WINDOW } = CONFIG;
    const game = useContext(GameContext);
    const battle = game.getBattle();
    
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
            WINDOW.WIDTH = window.innerWidth * (WINDOW.HEIGHT / window.innerHeight);
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
        const maxLeft = Math.max(0, GAME_FIELD_WIDTH - WINDOW.WIDTH + BORDER_PADDING);
        const maxTop = Math.max(0, GAME_FIELD_HEIGHT - WINDOW.HEIGHT + BORDER_PADDING);
        
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

            let isSelected = unit.isSelected && unit.isMyUnit();
            if (allocation.isSelectingStatus) {
                isSelected = allocation.isUnitInSelection(unit);
            }
                
            if (isSelected) {
                canvas.oval(unit.coords.x+0.15, unit.coords.y+0.8, 0.75, 0.3, 'rgba(0, 0, 0, 0.5)', 3, 'rgba(34, 255, 0, 1)');
            }

            if (!unit.isMyUnit()) {
                canvas.oval(unit.coords.x+0.15, unit.coords.y+0.8, 0.75, 0.3, 'rgba(0, 0, 0, 0.5)', 3, 'rgba(255, 0, 0, 1)');
            }

            if (unit.hasTarget()) {
                canvas.contextV.strokeStyle = 'rgba(255, 255, 0, 0.8)';
                canvas.contextV.lineWidth = 2;
                canvas.contextV.beginPath();
                canvas.contextV.arc(
                    canvas.xs(unit.coords.x + 0.5),
                    canvas.ys(unit.coords.y + 0.5),
                    canvas.dec(0.6),
                    0,
                    Math.PI * 2
                );
                canvas.contextV.stroke();
            }

            canvas.spriteFull(
                spritesImage, 
                unit.coords.x, 
                unit.coords.y, 
                spriteData[0], 
                spriteData[1], 
                spriteData[2]
            );
            
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

    const drawSelectionRect = (canvas: Canvas) => {
        if (!allocation.isSelectingStatus) return;
        const rect = allocation.getSelectionRect();
        if (rect) {
            canvas.contextV.fillStyle = "rgba(0, 255, 0, 0.2)";
            canvas.contextV.fillRect(canvas.xs(rect.x), canvas.ys(rect.y), canvas.dec(rect.width), canvas.dec(rect.height));
            canvas.contextV.strokeStyle = "rgba(0, 255, 0, 1)";
            canvas.contextV.strokeRect(canvas.xs(rect.x), canvas.ys(rect.y), canvas.dec(rect.width), canvas.dec(rect.height));
        }
    };

    function render(FPS: number) {
        if (!canvas || !battle) return;
        canvas.clear();
        if (background.complete) {
            canvas.contextV.drawImage(background, canvas.xs(0), canvas.ys(0), canvas.dec(87), canvas.dec(29));
        }
        const { units, buildings } = battle.getScene();
        drawUnits(canvas, units);
        drawBuildings(canvas, buildings);
        drawSelectionRect(canvas);
        canvas.render();
    }

    const mouseDown = (x: number, y: number) => {
        mouseDownPosition = { x, y };
        mouseDownTime = Date.now();
        wasDragging = false;

        allocation.start(x, y);
    };

    const mouseMove = (x: number, y: number, screenX?: number, screenY?: number) => {
        const { units, buildings } = battle.getScene();

        allocation.update(x, y);

        if (isMiddleMouseDragging && middleMouseStartScreenPosition && windowStartPosition && canvas && screenX !== undefined && screenY !== undefined) {
            const deltaX = (screenX - middleMouseStartScreenPosition.x) / canvas.WIDTH * WINDOW.WIDTH;
            const deltaY = (screenY - middleMouseStartScreenPosition.y) / canvas.HEIGHT * WINDOW.HEIGHT;
            
            WINDOW.LEFT = windowStartPosition.LEFT - deltaX;
            WINDOW.TOP = windowStartPosition.TOP - deltaY;
            
            clampCamera();
        }
    };

    const handleClick = async (x: number, y: number) => {
        if (!battle) return;

        if (allocation.isSelectingStatus) return;

        const tileX = Math.floor(x);
        const tileY = Math.floor(y);

        const { units, buildings } = battle.getScene();
        
        battle.handleClick(tileX, tileY);
        
        const selectedUnits = units.filter(u => u.isSelected && u.isMyUnit());
        if (selectedUnits.length > 0) {
            const targetUnit = units.find(u => 
                u.isEnemy() && 
                u.coords.x === tileX && 
                u.coords.y === tileY
            );
            
            const targetBuilding = buildings.find(b => {
                const [bx, by] = [b.coords[0].x, b.coords[0].y];
                if (b.size === 1) {
                    return tileX === bx && tileY === by;
                }
                return tileX >= bx && tileX < bx + 2 && tileY >= by && tileY < by + 2;
            });

            if (!targetUnit && !targetBuilding) {
                battle.moveUnits({ x: tileX, y: tileY }, units, buildings, game['server']);
            }
        }
    };

    const mouseUp = (x: number, y: number) => {
        if (!battle || !mouseDownPosition) return;
        const distance = Math.hypot(x - mouseDownPosition.x, y - mouseDownPosition.y);
        const timeElapsed = Date.now() - mouseDownTime;

        if (distance > DRAG_THRESHOLD || timeElapsed > TIME_THRESHOLD) {
            wasDragging = true;
            const myUnits = battle.getScene().units.filter(u => u.isMyUnit());
            allocation.end(myUnits);
        } else {
            wasDragging = false;
            allocation.cancel();
            handleClick(x, y);
        }
        
        mouseDownPosition = null;
        mouseDownTime = 0;
    };

    const mouseClick = async (x: number, y: number) => {
        if (!battle || wasDragging) return;

        const myUnits = battle.getScene().units.filter(u => u.isMyUnit());

        const clickedUnit = myUnits.find(u =>
            x >= u.coords.x &&
            x < u.coords.x + 1 &&
            y >= u.coords.y &&
            y < u.coords.y + 1
        );

        if (clickedUnit) {
            myUnits.forEach(u => u.updateSelection(false));
            clickedUnit.updateSelection(true);
            return;
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!battle) return;
        
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
        
        const scene = battle.getScene();

    };

    const INITIAL_WINDOW_WIDTH = CONFIG.WINDOW.WIDTH;
    const INITIAL_WINDOW_HEIGHT = CONFIG.WINDOW.HEIGHT;
    const INITIAL_WINDOW_LEFT = CONFIG.WINDOW.LEFT;
    const INITIAL_WINDOW_TOP = CONFIG.WINDOW.TOP;

    useEffect(() => {
        const tryLoadBattle = async () => {
        const id = game.getCurrentBattle();
        if (!id) {
            console.log("Battle ID ещё нет");
            return;
        }
        await battle.loadBattle();
    };
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

        battle.loadBattle();

        clampCamera();

        tryLoadBattle();

        return () => {
            if (WINDOW.WIDTH !== INITIAL_WINDOW_WIDTH) {
                WINDOW.WIDTH = INITIAL_WINDOW_WIDTH;
                WINDOW.HEIGHT = INITIAL_WINDOW_HEIGHT;
                WINDOW.LEFT = INITIAL_WINDOW_LEFT;
                WINDOW.TOP = INITIAL_WINDOW_TOP;
            }

            window.removeEventListener('resize', handleResize);

            battle?.destructor();
            canvas = null;
        };
    }, [ game ]);

    return (
        <div id={GAME_FIELD} className={GAME_FIELD}></div>
    );
};

export default BattleCanvas;