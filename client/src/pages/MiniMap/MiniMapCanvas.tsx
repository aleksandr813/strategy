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

const dummy = (...args: any[]) => {};


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
                mouseMove: dummy,  
                mouseDown: dummy, 
                mouseUp: dummy, 
                mouseRightClickDown: dummy, 
                mouseClick: handleClick,
                mouseLeave: dummy, 
                mouseWheel: dummy, 
                mouseMiddleDown: dummy, 
                mouseMiddleUp: dummy,
                keyDown: dummy,
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