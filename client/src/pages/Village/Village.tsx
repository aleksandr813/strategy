import React, { useEffect, useState } from 'react'; 
import CONFIG from '../../config';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import Game from '../../game/Game';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units/Unit';
import Build from '../../game/Builds/Building';
import Allocation from './UI/Allocation';
import { TPoint } from '../../config';
import Server,{ TBuildingFullData } from '../../services/server/Server';
import Store from '../../services/store/Store'; 

const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';

let game: Game | null = null;
let canvas: Canvas | null = null;
let server: Server | null = null;

const GamePage: React.FC<IBasePage> = (props: IBasePage) => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;
    const { setPage } = props;
    
    const [buildings, setBuildings] = useState<TBuildingFullData[]>([]);
    const CanvasComponent = useCanvas(render);
    let interval: NodeJS.Timer | null = null;
    const [[spritesImage], getSprite] = useSprites();
    const allocation = new Allocation();
    
    const mouseDownPosition = React.useRef<TPoint | null>(null);
    const mouseDownTime = React.useRef<number>(0);
    const wasDragging = React.useRef<boolean>(false);
    const DRAG_THRESHOLD = 5; 
    const TIME_THRESHOLD = 200; 


    function printFillSprite(image: HTMLImageElement, canvas: Canvas, { x = 0, y = 0 }: TPoint, points: number[]): void {
        canvas.spriteFull(image, x, y, points[0], points[1], points[2], points[3]);
    }

    function printHPBar(
        canvas: Canvas,
        x: number, 
        y: number, 
        widthUnits: number, 
        heightUnits: number, 
        currentHp: number,
        maxHp: number
    ): void {
        if (currentHp >= maxHp) {
            return;
        }

        const ctx = canvas.contextV;
        const hpRatio = currentHp / maxHp;
        const currentHpWidthUnits = widthUnits * hpRatio;

        ctx.fillStyle = "#A00000"; 
        ctx.fillRect(
            canvas.xs(x),
            canvas.ys(y),
            canvas.dec(widthUnits),
            canvas.dec(heightUnits)
        );

        ctx.fillStyle = "#00FF00";
        ctx.fillRect(
            canvas.xs(x),
            canvas.ys(y),
            canvas.dec(currentHpWidthUnits),
            canvas.dec(heightUnits)
        );
    }

    function printUnits(canvas: Canvas, units: Unit[]): void {
        const BAR_WIDTH_UNITS = 0.8; 
        const BAR_HEIGHT_UNITS = 0.1; 
        const OFFSET_Y_UNITS = 0.1; 

        units.forEach((unit) => {
            const displaySelected = allocation.isSelectingStatus
                ? allocation.isUnitInSelection(unit)
                : unit.isSelected;

            printFillSprite(spritesImage, canvas, unit.cords, getSprite(unit.sprite));
            
            if (displaySelected) {
                const ctx = canvas.contextV;
                const unitColor = 'rgba(0, 255, 0, 0.5)';
                ctx.fillStyle = unitColor;

                ctx.fillRect(
                    canvas.xs(unit.cords.x),
                    canvas.ys(unit.cords.y),
                    canvas.dec(1), 
                    canvas.dec(1) 
                );
            }

            const maxHp = unit.maxHp; 
            
            if (unit.hp < maxHp) {
                const barX = unit.cords.x + (1 - BAR_WIDTH_UNITS) / 2; 
                const barY = unit.cords.y - OFFSET_Y_UNITS; 

                printHPBar(
                    canvas, 
                    barX, 
                    barY, 
                    BAR_WIDTH_UNITS, 
                    BAR_HEIGHT_UNITS, 
                    unit.hp, 
                    maxHp
                );
            }
        });
    }

    function printBuilds(canvas: Canvas, builds: Build[]): void {
        const BAR_HEIGHT_UNITS = 0.2; 
        const OFFSET_Y_UNITS = 0.3;  

        builds.forEach((element) => {
            for (let i = 0; i < element.sprites.length; i++) {
                //console.log(element.cords[i])
                printFillSprite(spritesImage, canvas, element.cords[i], getSprite(element.sprites[i]));
            }

            const maxHp = element.MAX_HP;
            
            if (element.hp < maxHp) {
                const barWidthUnits = element.size; 
                const barX = element.cords[0].x;
                const barY = element.cords[0].y - BAR_HEIGHT_UNITS - OFFSET_Y_UNITS;

                printHPBar(
                    canvas, 
                    barX, 
                    barY, 
                    barWidthUnits, 
                    BAR_HEIGHT_UNITS, 
                    element.hp, 
                    maxHp
                );
            }
        });
    }

    function render(FPS: number): void {
        if (canvas && game) {
            canvas.clear();
            const { units, builds } = game.getScene();

            printUnits(canvas, units);
            printBuilds(canvas, builds);

            if (allocation.isSelectingStatus) {
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

            canvas.text(WINDOW.LEFT + 0.2, WINDOW.TOP + 0.5, String(FPS), GREEN);
            canvas.render();
        }
    }
    // ... (обработчики кнопок)
    const backClickHandler = () => setPage(PAGES.CHAT);
    const BattleClicHandler = () => setPage(PAGES.BATTLE);
    const CalculatorClicHandler = () => setPage(PAGES.CALCULATOR);
    const GlobalMapClicHandler = () => setPage(PAGES.GLOBAL_MAP);
    const VillageClicHandler = () => setPage(PAGES.VILLAGE);

    const mouseDown = (x: number, y: number) => {
        if (!game) return;
        mouseDownPosition.current = { x, y };
        mouseDownTime.current = Date.now();
        wasDragging.current = false;
        allocation.start(x, y);
    };

    const mouseMove = (x: number, y: number) => {
        allocation.update(x, y);
    };

    const mouseUp = (x: number, y: number) => {
        if (!game) return;
        const { units } = game.getScene();

        const startPos = mouseDownPosition.current;
        if (startPos) {
            const distance = Math.sqrt(
                Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
            );
            const timeElapsed = Date.now() - mouseDownTime.current;

            if (distance > DRAG_THRESHOLD || timeElapsed > TIME_THRESHOLD) {
                wasDragging.current = true;
                allocation.end(units);
            } else {
                allocation.cancel();
            }
        }
        mouseDownPosition.current = null;
        mouseDownTime.current = 0;
    };

    const mouseClick = (x: number, y: number) => {
        if (!game || wasDragging.current) return;

        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        const { builds } = game.getScene();

        for (const build of builds) {
            const buildX = build.cords[0].x;
            const buildY = build.cords[0].y;
            if (gridX >= buildX && gridX < buildX + 2 && gridY >= buildY && gridY < buildY + 2) {
                build.takeDamage(10); 
                console.log(`Building HP: ${build.hp}`);
                return; 
            }
        }

        if (!allocation.isSelectingStatus) {
            game.moveUnits({ x, y });
            console.log('click: move units to', { x, y });
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!game) return;
        const { units } = game.getScene();
        allocation.clearSelection(units);
        console.log('right click: clear selection');
    };

    useEffect(() => {
        server = new Server(new Store()); 
        
        const loadBuildings = async () => {
            console.log('Fetching buildings from server...');
            const result = await server!.getBuildings(); 
            if (result && result.buildings) {
                setBuildings(result.buildings);
            }
        };

        loadBuildings();
        
        return () => {
            server = null; 
        }
    }, []); 
    useEffect(() => {
        game = new Game(); 
        if (buildings.length > 0) {
            game.loadBuildings(buildings);
        }
        canvas = CanvasComponent({
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
            game = null;
            canvas = null;
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };
    }, [buildings]);

    // ... (useEffect для keydown)
    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            console.log("keyDownHandler");
        };
        document.addEventListener('keydown', keyDownHandler);
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);

    return (
        <div className='game'>
            <h1>Менеджмент деревни</h1>
            <Button onClick={BattleClicHandler} text='Battle'/>
            <Button onClick={CalculatorClicHandler} text='Calculator'/>
            <Button onClick={GlobalMapClicHandler} text='GlobalMap'/>
            <Button onClick={VillageClicHandler} text='Village'/>
            <Button onClick={backClickHandler} text='Назад' />
            <div id={GAME_FIELD} className={GAME_FIELD}></div>
            <div className='villageManagmentUI'>
                <p>Монеты: 100</p>
            </div>
        </div>
    );
};

export default GamePage;