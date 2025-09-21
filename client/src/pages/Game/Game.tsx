import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import CONFIG from '../../config';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import Game from '../../game/Game';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units';

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

const GamePage: React.FC<IBasePage> = (props: IBasePage) => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;
    const { setPage } = props;
    let game: Game | null = null;
    // инициализация канваса
    let canvas: Canvas | null = null;
    const Canvas = useCanvas(render);
    let interval: NodeJS.Timer | null = null;
    // инициализация карты спрайтов
    const [
        [spritesImage],
        getSprite,
    ] = useSprites();

    function printFillSprite(image: HTMLImageElement, canvas: Canvas, { x = 0, y = 0 }, points: number[]): void {
        canvas.spriteFull(image, x, y, points[0], points[1], points[2]);
    }

    function printUnits(canvas: Canvas, unitsMatrix: Unit[]): void {
        unitsMatrix.forEach((element) => {
            printFillSprite(spritesImage, canvas, { element.dx, element.dy }, points);
        })
    }

    


    // функция отрисовки одного кадра сцены
    function render(FPS: number): void {
        if (canvas && game) {
            canvas.clear();
            const { kapitoshka } = game.getScene();

            /************************/
            /* нарисовать Капитошку */
            /************************/
            const { x, y } = kapitoshka;
            printKapitoshka(canvas, { x, y }, getSprite(1));

            /******************/
            /* нарисовать FPS */
            /******************/
            canvas.text(WINDOW.LEFT + 0.2, WINDOW.TOP + 0.5, String(FPS), GREEN);
            /************************/
            /* отрендерить картинку */
            /************************/
            canvas.render();
        }
    }

    const backClickHandler = () => setPage(PAGES.CHAT);

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
        game = new Game();
        canvas = Canvas({
            parentId: GAME_FIELD,
            WIDTH: WINDOW.WIDTH * SPRITE_SIZE,
            HEIGHT: WINDOW.HEIGHT * SPRITE_SIZE,
            WINDOW,
            callbacks: {
                mouseMove,
                mouseClick,
                mouseRightClick,
            },
        });
        return () => {
            // деинициализировать все экземпляры
            game?.destructor();
            canvas?.destructor();
            canvas = null;
            game = null;
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }
    });

    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            console.log("keyDownHandler")
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