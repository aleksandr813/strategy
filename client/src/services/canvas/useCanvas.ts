import Canvas, { TCanvas } from './Canvas';

declare global {
    interface Window {
        requestAnimFrame(callback: FrameRequestCallback): number;
        webkitRequestAnimationFrame(callback: FrameRequestCallback): number;
        mozRequestAnimationFrame(callback: FrameRequestCallback): number;
        oRequestAnimationFrame(callback: FrameRequestCallback): number;
        msRequestAnimationFrame(callback: FrameRequestCallback): number;
    }
}

export default function useCanvas(render = (canvas: Canvas, fps: number) => { }) {
    window.requestAnimFrame = (() => {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    //переменные для FPS
    let FPS = 0;
    let outFPS = 0;
    let lastTimestamp = Date.now(); 
    let canvasInstance: Canvas | null = null;

    const animLoop = () => {
        //calc fps
        FPS++;
        const timestamp = Date.now();
        if (timestamp - lastTimestamp >= 1000) {
            outFPS = FPS;
            FPS = 0;
            lastTimestamp = timestamp;
        }
        if (canvasInstance) {
            render(canvasInstance, outFPS); //print scene
        }
        window.requestAnimFrame(animLoop);
    }

    return (params: TCanvas) => {
        setTimeout(() => animLoop(), 300); // таймаут необходим для корректной отрисовки первого кадра сцены, потому что статика не успевает подгрузиться
        canvasInstance = new Canvas(params);
        return canvasInstance;
    };
}