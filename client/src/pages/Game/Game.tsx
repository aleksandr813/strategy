import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import CONFIG from '../../config';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import Game from '../../game/Game';
import {Allocation} from '../../game/UI/allocation';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units';
import Build from '../../game/Builds';

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const GamePage: React.FC<IBasePage> = (props: IBasePage) => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;
    const { setPage } = props;
    const gameRef = useRef<Game | null>(null);
    const canvasRef = useRef<Canvas | null>(null);
    const allocationRef = useRef<Allocation | null>(null);
    const createCanvas = useCanvas(render);
    let interval: NodeJS.Timer | null = null;
    // инициализация карты спрайтов
    const [
        [spritesImage],
        getSprite,
    ] = useSprites();

    function printFillSprite(image: HTMLImageElement, canvas: Canvas, { x = 0, y = 0 }, points: number[]): void { //В массиве points хранятся sx, sy, size
        canvas.spriteFull(image, x, y, points[0], points[1], points[2]);
    }

    function printUnits(canvas: Canvas, units: Unit[], points: number[]): void { // Вот тут по отдельности должен отрисовываться юнит на своих координатах
        units.forEach((element) => {
            printFillSprite(spritesImage, canvas, element.cords, points); 
            if (element.isHightlited) {
                canvas.rectangle(
                    element.cords.x, 
                    element.cords.y, 
                    SPRITE_SIZE,  
                    SPRITE_SIZE,  
                    'rgba(0, 255, 0, 0.4)'
                );
            }
        })
    }

    function printBuilds(canvas: Canvas, builds: Build[], points: number[]): void {
        builds.forEach((element) => {
            printFillSprite(spritesImage, canvas, element.cords[1], points)
        })
    }


    // функция отрисовки одного кадра сцены
    function render(canvas: Canvas, FPS: number): void {
        if (canvas && gameRef.current) {
            canvas.clear();

            const { units } = gameRef.current.getScene();
            const { builds } = gameRef.current.getScene();

            /************************/
            /* нарисовать Юнитов */
            /************************/ 
            printUnits(canvas, units, getSprite(1)); 
            printBuilds(canvas, builds, getSprite(2));

            /******************/
            /* нарисовать FPS */
            /******************/
            canvas.text(WINDOW.LEFT + 0.2, WINDOW.TOP + 0.5, String(FPS), GREEN);

            canvas.drawSelectionRect();
            canvas.render();
        }
    }

    const backClickHandler = () => setPage(PAGES.CHAT);
    const onSelectionEnd = (startX: number, startY: number, endX: number, endY: number) => {
        allocationRef.current?.selection(startX, startY, endX, endY);
    };

    /****************/
    /* Mouse Events */
    /****************/
    const mouseMove = (_x: number, _y: number) => {
    }

    const mouseClick = (_x: number, _y: number) => {
    }

    const mouseRightClick = () => {
    }
    /****************/

    useEffect(() => {
        // инициализация игры
        gameRef.current = new Game();
        allocationRef.current = new Allocation(gameRef.current);
        canvasRef.current = createCanvas({
            parentId: GAME_FIELD,
            WIDTH: WINDOW.WIDTH * SPRITE_SIZE,
            HEIGHT: WINDOW.HEIGHT * SPRITE_SIZE,
            WINDOW,
            callbacks: {
                mouseMove,
                mouseClick,
                mouseRightClick,
                onSelectionEnd
            },
        });
        return () => {
            // деинициализировать все экземпляры
            gameRef.current?.destructor();
            canvasRef.current?.destructor();
            canvasRef.current = null;
            gameRef.current = null;
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }
    },[spritesImage, createCanvas]);

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            console.log("keyDownHandler");
        }

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        }
    });

    return (<div className='game'>
        <h1>Игра</h1>
        <Button onClick={backClickHandler} text='Назад' />
        <div id={GAME_FIELD} className={GAME_FIELD}></div>
    </div>)
}

export default GamePage;