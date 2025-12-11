import React, { useEffect } from 'react';
import { Canvas, useCanvas } from '../../services/canvas'; 
import CONFIG, { TWINDOW } from '../../config'; 

const MINIMAP_FIELD = 'minimap-field'; 
const MINIMAP_WIDTH = 150; 
const MINIMAP_HEIGHT = 150;
const BORDER_COLOR = '#eb1212ff';

interface MiniMapCanvasProps {
    onMapClick: () => void; 
}

let canvas: Canvas | null = null;

const stupidCallback = (x: number, y: number, screenX?: number, screenY?: number) => {}; //пока что коллбэки заглушки
const stupidCallbackWheel = (delta: number, x: number, y: number) => {};
const stupidCallbackKey = (event: KeyboardEvent) => {};
const stupidCallbackNoArgs = () => {};


const MiniMapCanvas: React.FC<MiniMapCanvasProps> = ({ onMapClick }) => {
    const CanvasRef = useCanvas(render);
    const handleClick = (x: number, y: number) => {
        onMapClick(); 
    };

    function render(FPS: number) {
        if (!canvas) return;
        
        canvas.clear(); 
        
        canvas.contextV.strokeStyle = BORDER_COLOR;
        canvas.contextV.lineWidth = 2;
        canvas.contextV.strokeRect(0, 0, canvas.WIDTH, canvas.HEIGHT);

        canvas.render();
    }
    
    useEffect(() => {
        const MINIMAL_WINDOW: TWINDOW = {
            LEFT: 0, 
            TOP: 0, 
            WIDTH: 10, 
            HEIGHT: 10 
        };

        canvas = CanvasRef({
            parentId: MINIMAP_FIELD,
            WIDTH: MINIMAP_WIDTH, 
            HEIGHT: MINIMAP_HEIGHT,
            WINDOW: MINIMAL_WINDOW, 
            callbacks: {
                mouseMove: stupidCallback, 
                mouseDown: stupidCallback, 
                mouseUp: stupidCallback, 
                mouseRightClickDown: stupidCallback, 
                mouseClick: handleClick,
                mouseLeave: stupidCallbackNoArgs, 
                mouseWheel: stupidCallbackWheel, 
                mouseMiddleDown: stupidCallback, 
                mouseMiddleUp: stupidCallbackNoArgs,
                keyDown: stupidCallbackKey,
            },
        });

        if (canvas) {
            canvas.context.imageSmoothingEnabled = false;
        }

        return () => {
            canvas?.destructor();
            canvas = null;
        };
    }, [CanvasRef, onMapClick]);

    return (
        <div className='MiniMapCanvas'>
            <div 
                id={MINIMAP_FIELD} 
                className={MINIMAP_FIELD} 
                style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT, border: '1px solid gray' }}
            ></div>
        </div>
    );
};

export default MiniMapCanvas;