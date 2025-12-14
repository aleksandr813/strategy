import React, { useEffect, useContext } from 'react';
import CONFIG from '../../config';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from '../../hooks/useSprites';
import ArmyEntity from '../../game/entities/ArmyEntity';
import VillageEntity from '../../game/entities/VillageEntity';
import { GameContext } from '../../App';
import { TPoint } from '../../config';
import globalMapBackground from '../../assets/img/background/globalMapBackground.png';

import "./GlobalMap.scss";

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;

let zoomFactor = 1;

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
    const ctx = canvas.contextV;

    villages.forEach((village) => {
        drawSprites(canvas, village, [village.coords]);

        const screenX = Math.round(canvas.xs(village.coords.x));
        const screenY = Math.round(canvas.ys(village.coords.y));

        ctx.save();

        const FONT_SIZE = 32;
        ctx.font = `${FONT_SIZE}px PixelifySans-Bold`;
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'bottom';

        const textWidth = ctx.measureText(village.name).width;

        ctx.fillText(
            village.name,
            screenX - Math.round(textWidth / 2),
            screenY - 6
        );

        ctx.restore();
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
        if (delta > 0) {
            zoomFactor = 1.1;
        } else {
            zoomFactor = 0.9;
        }
        const oldWidth = WINDOW.WIDTH;
        const oldHeight = WINDOW.HEIGHT;
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