import React, { useEffect, useContext } from 'react';
import CONFIG from '../../config';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import Unit from '../../game/Units/Unit';
import Building from '../../game/Buildings/Building';
import Allocation from './UI/Allocation';
import { GameContext, ServerContext } from '../../App';
import { TPoint } from '../../config';
import VillageManager from './villageDataManager';
import villageBackground from '../../assets/img/background/villageBackground.png'

import "./Village.scss"

import wooden_background from "../../assets/img/UI/wooden_background.png";
import building_otions from "../../assets/img/UI/building_otions.png";
import leaderboard from "../../assets/img/UI/leaderboard.png";
import settings from "../../assets/img/UI/settings.png";
import unit_options from "../../assets/img/UI/unit_options.png";
import placeholder_village_icon from "../../assets/img/UI/placeholder_village_icon.png";
import Rectangle from "../../assets/img/UI/Rectangle.png";
import money_icon from "../../assets/img/UI/money_icon.png"
import Group from "../../assets/img/UI/Group .png"


const GAME_FIELD = 'game-field';
const GREEN = '#00e81c';
const DRAG_THRESHOLD = 5;
const TIME_THRESHOLD = 200;

let zoomFactor = 1;

const VillageCanvas: React.FC = () => {
    const { WINDOW, SPRITE_SIZE } = CONFIG;

    const game = useContext(GameContext)
    const server = useContext(ServerContext)

    const background = new Image()
    background.src = villageBackground

    let canvas: Canvas | null = null;
    const Canvas = useCanvas(render);

    const allocation = new Allocation();

    let mouseDownPosition: TPoint | null = null;
    let mouseDownTime: number = 0;
    let wasDragging: boolean = false;
    let isMiddleMouseDragging: boolean = false;
    let middleMouseStartPosition: TPoint | null = null;
    let windowStartPosition: { LEFT: number, TOP: number } | null = null;
    
    const [[spritesImage], getSprite] = useSprites();

    function drawHPBar(
        canvas: Canvas,
        x: number,
        y: number,
        width: number,
        height: number,
        currentHp: number,
        maxHp: number
    ): void {
        if (currentHp >= maxHp) return;

        const ctx = canvas.contextV;
        const hpRatio = currentHp / maxHp;

        ctx.fillStyle = "#A00000";
        ctx.fillRect(canvas.xs(x), canvas.ys(y), canvas.dec(width), canvas.dec(height));

        ctx.fillStyle = "#00FF00";
        ctx.fillRect(canvas.xs(x), canvas.ys(y), canvas.dec(width * hpRatio), canvas.dec(height));
    }

    function drawBackground(canvas:Canvas):void {
            if (background.complete) {
                canvas.contextV.drawImage(
                    background,
                    canvas.xs(0),
                    canvas.ys(0),
                    canvas.dec(87),
                    canvas.dec(29) 
                );
            }
    }

    function drawUnits(canvas: Canvas, units: Unit[]): void {
        const ctx = canvas.contextV;

        units.forEach((unit) => {
            const sprite = getSprite(unit.sprite);
            canvas.spriteFull(spritesImage, unit.cords.x, unit.cords.y, sprite[0], sprite[1], sprite[2]);

            const isSelected = allocation.isSelectingStatus
                ? allocation.isUnitInSelection(unit)
                : unit.isSelected;

            if (isSelected) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.fillRect(canvas.xs(unit.cords.x), canvas.ys(unit.cords.y), canvas.dec(1), canvas.dec(1));
            }

            if (unit.hp < unit.maxHp) {
                drawHPBar(canvas,
                    unit.cords.x + 0.1,
                    unit.cords.y - 0.1,
                    0.8,
                    0.1,
                    unit.hp,
                    unit.maxHp
                );
            }
        });
    }

    function drawBuildings(canvas: Canvas, buildings: Building[]): void {
        buildings.forEach((building) => {
            building.sprites.forEach((sprite, i) => {
                const spriteData = getSprite(sprite);
                canvas.spriteFull(spritesImage, building.cords[i].x, building.cords[i].y, spriteData[0], spriteData[1], spriteData[2]);
            });

            if (building.hp < building.maxHp) {
                drawHPBar(canvas,
                    building.cords[0].x,
                    building.cords[0].y - 0.5,
                    building.size,
                    0.2,
                    building.hp,
                    building.maxHp
                );
            }
        });
    }

    function drawBuildingPreview(canvas: Canvas): void {
        const previewData = game.getScene().buildingPreview.getRenderData();
        if (!previewData) return;

        const { gridPosition, canPlace } = previewData;
        const ctx = canvas.contextV;
        const color = canPlace ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';

        ctx.fillStyle = color;
        ctx.fillRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(2), canvas.dec(2));

        ctx.strokeStyle = canPlace ? '#00FF00' : '#FF0000';
        ctx.lineWidth = 2;
        ctx.fillRect(canvas.xs(gridPosition.x), canvas.ys(gridPosition.y), canvas.dec(2), canvas.dec(2));
    }

    function drawSelectionRect(canvas: Canvas): void {
        if (!allocation.isSelectingStatus) return;

        const rect = allocation.getSelectionRect();
        if (rect) {
            canvas.contextV.fillStyle = "rgba(0, 255, 0, 0.5)";
            canvas.contextV.fillRect(canvas.xs(rect.x), canvas.ys(rect.y), canvas.dec(rect.width), canvas.dec(rect.height));
        }
    }

    function drawMenu(canvas: Canvas): void {
        if (!wooden_background) return;
        const img1 = new Image();
        img1.src = wooden_background;
        img1.height = img1.height * canvas.WIDTH / img1.width;
        img1.width = canvas.WIDTH;
        canvas.drawImageFull(
            img1,
            0,
            canvas.HEIGHT - img1.height,
            img1.width,
            img1.height
        );

        if (!building_otions) return;
        const img2 = new Image();
        img2.src = building_otions;
        img2.height = img1.height / 2;
        img2.width = img1.height / 2;
        canvas.drawImageFull(
            img2,
            img1.width - img2.width,
            canvas.HEIGHT - img2.height * 2,
            img2.width,
            img2.height
        );

        if (!leaderboard) return;
        const img3 = new Image();
        img3.src = leaderboard;
        img3.height = img1.height / 2;
        img3.width = img1.height / 2;
        canvas.drawImageFull(
            img3,
            img1.width - img3.width * 2,
            canvas.HEIGHT - img3.height * 2,
            img3.width,
            img3.height
        );
        
        if (!settings) return;
        const img4 = new Image();
        img4.src = settings;
        img4.height = img1.height / 2;
        img4.width = img1.height / 2;
        canvas.drawImageFull(
            img4,
            img1.width - img4.width *2,
            canvas.HEIGHT - img4.height,
            img4.width,
            img4.height
        );

        if (!unit_options) return;
        const img5 = new Image();
        img5.src = unit_options;
        img5.height = img1.height / 2;
        img5.width = img1.height / 2;
        canvas.drawImageFull(
            img5,
            img1.width - img5.width,
            canvas.HEIGHT - img5.height ,
            img5.width,
            img5.height
        );

        if (!placeholder_village_icon && Rectangle) return;
        const img6 = new Image();
        const img7 = new Image();

        img7.src = Rectangle;
        img7.height = img1.height / 2;
        img7.width = img1.height / 2;

        img6.src = placeholder_village_icon;
        img6.height = img1.height / 2;
        img6.width = img1.height / 2;

        canvas.drawImageFull(
            img7,
            0,
            canvas.HEIGHT - img6.height *2,
            img6.width,
            img6.height
        );

        canvas.drawImageFull(
            img6,
            0,
            canvas.HEIGHT - img6.height*2,
            img6.width,
            img6.height
        );

        if (!money_icon) return;
        const img8 = new Image();
        img8.src = money_icon;
        img8.height = img1.height / 2;
        img8.width = img1.height / 2;
        canvas.drawImageFull(
            img8,
            0,
            canvas.HEIGHT - img8.height+10,
            img8.width,
            img8.height
        );

        if (!Group) return;
        const img9 = new Image();
        img9.src = Group;
        img9.height = img1.height;
        img9.width = img1.height;
        canvas.drawImageFull(
            img9,
            img1.width - img9.width * 2,
            canvas.HEIGHT - img9.height,
            img9.width,
            img9.height
        );
        // if (!building_otions) return;
        // const img2 = new Image();
        // img2.src = building_otions;
        // canvas.drawImageFull(
        //     img2,
        //     img1.
        // )
    }

    function render(FPS: number): void {
        if (canvas && game) {
            canvas.clear();

            drawBackground(canvas);

            const { units, buildings } = game.getScene();

            drawUnits(canvas, units);
            drawBuildings(canvas, buildings);
            drawSelectionRect(canvas);
            drawBuildingPreview(canvas);
            drawMenu(canvas);

            canvas.text(WINDOW.LEFT + 0.2, WINDOW.TOP + 0.5, String(FPS), GREEN);
            canvas.render();
        }
    }

    const mouseDown = (x: number, y: number) => {
        if (game.getScene().buildingPreview.isActiveStatus()) return;

        mouseDownPosition = { x, y };
        mouseDownTime = Date.now();
        wasDragging = false;
        allocation.start(x, y);
    };

    const mouseMove = (x: number, y: number) => {
        if (game.getScene().buildingPreview.isActiveStatus() && game) {
            const { units, buildings } = game.getScene();
            const matrix = game.getVillageMatrix(units, buildings);
            game.getScene().buildingPreview.update(x, y, matrix);
        } else {
            allocation.update(x, y);
        }

        // Перемещение камеры средней кнопкой мыши
        if (isMiddleMouseDragging && middleMouseStartPosition && windowStartPosition && canvas) {
            const deltaX = x - middleMouseStartPosition.x;
            const deltaY = y - middleMouseStartPosition.y;
            
            WINDOW.LEFT = windowStartPosition.LEFT - deltaX;
            WINDOW.TOP = windowStartPosition.TOP - deltaY;
        }

    };

    const mouseUp = (x: number, y: number) => {
        if (!game) return;

        if (mouseDownPosition) {
            const distance = Math.sqrt(
                Math.pow(x - mouseDownPosition.x, 2) + Math.pow(y - mouseDownPosition.y, 2)
            );
            const timeElapsed = Date.now() - mouseDownTime;

            if (distance > DRAG_THRESHOLD || timeElapsed > TIME_THRESHOLD) {
                wasDragging = true;
                allocation.end(game.getScene().units);
            } else {
                allocation.cancel();
            }
        }

        mouseDownPosition = null;
        mouseDownTime = 0;
    };

    const mouseClick = async (x: number, y: number) => {
        if (!game || wasDragging) return;

        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        const { buildings } = game.getScene();

        for (const building of buildings) {
            const [bx, by] = [building.cords[0].x, building.cords[0].y];
            if (gridX >= bx && gridX < bx + 2 && gridY >= by && gridY < by + 2) {
                building.takeDamage(10);
                return;
            }
        }

        if (!allocation.isSelectingStatus) {
            game.moveUnits({ x, y });
            console.log('move units to', { x, y });
        }

        // Режим размещения здания
        if (game.getScene().buildingPreview.isActiveStatus()) {
            const newBuilding = game.getScene().buildingPreview.tryPlace();
            if (newBuilding) {
                const typeId = game.getScene().buildingPreview.getBuildingTypeId();
                const pos = game.getScene().buildingPreview.getPlacementPosition();

                try {
                    const result = await server.buyBuilding(typeId, pos.x, pos.y);

                    console.log('Результат buyBuilding:', result);

                    if (result && !result.error) {
                        game.addBuilding(newBuilding);
                    } else {
                        console.error('Ошибка при покупке здания:', result?.error || result);
                        game.getScene().buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
                    }
                } catch (error) {
                    console.error('Ошибка запроса:', error);
                    game.getScene().buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
                }
            }
            return;
        }
    };

    const mouseRightClickDown = (x: number, y: number) => {
        if (!game) return;

        if (game.getScene().buildingPreview.isActiveStatus()) {
            game.getScene().buildingPreview.deactivate();
            console.log('Размещение здания отменено');
        } else {
            allocation.clearSelection(game.getScene().units);
            console.log('Выделение снято');
        }
    };

    const mouseLeave = () => {
        console.log('Мышь покинула канвас');
        wasDragging = false;
        isMiddleMouseDragging = false;
        middleMouseStartPosition = null;
        windowStartPosition = null;
        allocation.cancel();
    };

    const mouseWheel = (delta: number, x: number, y: number) => {
        if (!canvas) return;

        zoomFactor = delta > 0 ? 1.1 : 0.9;
        
        const worldX = x;
        const worldY = y;
        
        //Зум
        const oldWidth = WINDOW.WIDTH;
        const oldHeight = WINDOW.HEIGHT;
        
        WINDOW.WIDTH *= zoomFactor;
        WINDOW.HEIGHT *= zoomFactor;

        const relativeX = (worldX - WINDOW.LEFT) / oldWidth;
        const relativeY = (worldY - WINDOW.TOP) / oldHeight;

        WINDOW.LEFT = worldX - relativeX * WINDOW.WIDTH;
        WINDOW.TOP = worldY - relativeY * WINDOW.HEIGHT;

        
    };

    const mouseMiddleDown = (x: number, y: number) => {
        isMiddleMouseDragging = true;
        middleMouseStartPosition = { x, y };
        windowStartPosition = { LEFT: WINDOW.LEFT, TOP: WINDOW.TOP };
    };

    const mouseMiddleUp = (x: number, y: number) => {
        isMiddleMouseDragging = false;
        middleMouseStartPosition = null;
        windowStartPosition = null;
    };

    const keyDown = (event: KeyboardEvent) => {
        if (game.getScene().buildingPreview.isActiveStatus()) {
            game.getScene().buildingPreview.deactivate();
            console.log('Размещение здания отменено (ESC)');
        }
    };

    useEffect(() => {
        canvas = Canvas({
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
                mouseLeave,
                mouseWheel,
                mouseMiddleDown,
                mouseMiddleUp,
                keyDown,
            },
        });

        (async () => {
        await game.loadBuildings(server);
        game.setBuildings(game.getScene().buildings);
    })();


        return () => {
            game?.destructor();
            canvas?.destructor();
            canvas = null;
        };
    }, []);

    return (
        <div className='VillageCanvas'>
            <div id={GAME_FIELD} className={GAME_FIELD}></div>
        </div>
    );
};

export default VillageCanvas;