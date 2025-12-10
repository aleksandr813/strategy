import React, { useEffect, useContext } from 'react';
import CONFIG from '../../config';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from '../../hooks/useSprites';
import ArmyEntity from '../../game/entities/ArmyEntity';
import VillageEntity from '../../game/entities/VillageEntity';
import { GameContext } from '../../App';
import { TPoint } from '../../config';
import globalMapBackground from '../../assets/img/background/globalMapBackground.png';
import GAMECONFIG from '../../game/gameConfig';

import "./GlobalMap.scss";

const GAME_FIELD = 'game-field';

// Константы для ограничения масштабирования
const MIN_ZOOM = GAMECONFIG.MIN_ZOOM; // Минимальный размер окна
const MAX_ZOOM = GAMECONFIG.MAX_ZOOM; // Максимальный размер окна (всё поле видно)
const ZOOM_SPEED = GAMECONFIG.ZOOM_SPEED; // Скорость зума
const ZOOM_THRESHOLD = GAMECONFIG.ZOOM_THRESHOLD; // Порог для предотвращения микро-корректировок

// Размеры игрового поля (должны совпадать с размерами фона)
const GAME_FIELD_WIDTH = GAMECONFIG.GRID_WIDTH;
const GAME_FIELD_HEIGHT = GAMECONFIG.GRID_HEIGHT;

const GlobalMapCanvas: React.FC = () => {
    const { WINDOW } = CONFIG;
    const game = useContext(GameContext);
    const globalMap = game.getGlobalMap(); 
    
    const background = new Image();
    background.src = globalMapBackground;

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

    const drawSprites = (canvas: Canvas, item: ArmyEntity | VillageEntity, coords: TPoint[]) => {
        item.sprites.forEach((sprite, i) => {
            const spriteData = getSprite(sprite);
            canvas.spriteFull(spritesImage, coords[i].x, coords[i].y, spriteData[0], spriteData[1], spriteData[2]);
        });
    };

    function render(FPS: number) {
        if (!canvas) return;
        canvas.clear();
        if (background.complete) {
            canvas.contextV.drawImage(background, canvas.xs(0), canvas.ys(0), canvas.dec(87), canvas.dec(29));
        }

        const { armies, villages } = globalMap.getMap();

        drawVillages(canvas, villages);
        //canvas.drawFPS(String(FPS), GREEN);
        canvas.render();
    }

    const drawVillages = (canvas: Canvas, villages: VillageEntity[]) => {
        villages.forEach((village) => {
            drawSprites(canvas, village, [village.coords]);
            canvas.text(village.coords.x, village.coords.y, village.name);
        });
    };


    const mouseDown = (x: number, y: number) => {
        mouseDownPosition = { x, y };
        mouseDownTime = Date.now();
        wasDragging = false;
    };

    const mouseMove = (x: number, y: number, screenX?: number, screenY?: number) => {
        if (isMiddleMouseDragging && middleMouseStartScreenPosition && windowStartPosition && canvas && screenX !== undefined && screenY !== undefined) {
         
            const deltaX = (screenX - middleMouseStartScreenPosition.x) / canvas.WIDTH * WINDOW.WIDTH;
            const deltaY = (screenY - middleMouseStartScreenPosition.y) / canvas.HEIGHT * WINDOW.HEIGHT;
            
           
            WINDOW.LEFT = windowStartPosition.LEFT - deltaX;
            WINDOW.TOP = windowStartPosition.TOP - deltaY;
            
         
            clampCameraPosition();
        }
    };

    const mouseUp = (x: number, y: number) => {
        if (!globalMap || !mouseDownPosition) return;
        mouseDownPosition = null;
        mouseDownTime = 0;
    };

    const mouseClick = async (x: number, y: number) => {
        console.log(x, y);
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!globalMap) return;
    };

    const mouseLeave = () => {
        console.log('Мышь покинула канвас');
        wasDragging = false;
        isMiddleMouseDragging = false;
        middleMouseStartScreenPosition = null;
        windowStartPosition = null;
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

   
        clampCameraPosition();

        return () => {
            if (WINDOW.WIDTH !== INITIAL_WINDOW_WIDTH) {
                WINDOW.WIDTH = INITIAL_WINDOW_WIDTH;
                WINDOW.HEIGHT = INITIAL_WINDOW_HEIGHT;
                WINDOW.LEFT = INITIAL_WINDOW_LEFT;
                WINDOW.TOP = INITIAL_WINDOW_TOP;
            }

            window.removeEventListener('resize', handleResize);

            globalMap?.destructor();
            //canvas?.destructor();
            canvas = null;
        };
    }, []);

    return (
        <div className='GlobalMapCanvas'>
            <div id={GAME_FIELD} className={GAME_FIELD}></div>
        </div>
    );
};

export default GlobalMapCanvas;