import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import CONFIG from '../../config';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import Game from '../../game/Game';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units/Unit';
import Build from '../../game/Builds/Build';
import Allocation from './UI/Allocation';

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

    const allocation = new Allocation();

    function printFillSprite(image: HTMLImageElement, canvas: Canvas, { x = 0, y = 0 }, points: number[]): void { //В массиве points хранятся sx, sy, size
        canvas.spriteFull(image, x, y, points[0], points[1], points[2]);
    }

    function printUnits(canvas: Canvas, units: Unit[]): void {
    units.forEach((unit) => {
        const displaySelected = allocation.isSelectingStatus
            ? allocation.isUnitInSelection(unit)
            : unit.isSelected;

        printFillSprite(spritesImage, canvas, unit.cords, getSprite(unit.sprite));
        if (displaySelected) {
        const unitColor = 'rgba(0, 255, 0, 0.5)'; 
        canvas.rectangle(unit.cords.x, unit.cords.y, SPRITE_SIZE, SPRITE_SIZE, unitColor);
}
    });
}

    function printBuilds(canvas: Canvas, builds: Build[]): void {
        builds.forEach((element) => {
            for (let i=0; i < element.sprites.length; i++) {
                printFillSprite(spritesImage, canvas, element.cords[i], getSprite(element.sprites[i]))
            }
        })
    }


    // функция отрисовки одного кадра сцены
    function render(FPS: number): void {
        if (canvas && game) {
            canvas.clear();

            const { units } = game.getScene();
            const { builds } = game.getScene();

            /************************/
            /* нарисовать Юнитов */
            /************************/ 
            printUnits(canvas, units); 
            printBuilds(canvas, builds);

            if (allocation.isSelectingStatus) {
            const rect = allocation.getSelectionRect();
            if (rect) {
                canvas.contextV.fillStyle = "rgba(0, 255, 0, 0.3)";
                canvas.contextV.fillRect(
                canvas.xs(rect.x),
                canvas.ys(rect.y),
                canvas.dec(rect.width),
                canvas.dec(rect.height)
                );
            }
        }

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

    const mouseDown = (_x: number, _y: number) => {
        //
    }
    const mouseMove = (_x: number, _y: number) => {
        allocation.update(_x, _y);
    }
    const mouseUp = (_x: number, _y: number) => {
        //
    };
    const mouseRightClickDown = (_x:number, _y: number) => {
        if (!game) return;
        //console.log('down')
        allocation.start(_x, _y);
        const { units } = game.getScene();
        allocation.update(_x, _y); 
    };
    const mouseRightClickUp = (_x:number, _y: number) => {
        if (!game) return;
        //console.log('up')
        const { units } = game.getScene();
        allocation.end(units);
    };
    const mouseClick = (_x: number, _y:number) => {
        game?.moveUnits({x: _x, y: _y});
        console.log('click')
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
                mouseDown,
                mouseUp,
                mouseRightClickUp,
                mouseRightClickDown,
                mouseClick,
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
            console.log("keyDownHandler");
        }

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        }
    });

    return (<div className='game'>
        <h1>Менеджмент деревни</h1>
        <Button onClick={backClickHandler} text='Назад' />
        <div id={GAME_FIELD} className={GAME_FIELD}></div>
        <div className='villageManagmentUI'>
            <p>Монеты: 100</p>
        </div>
    </div>)
}

export default GamePage;