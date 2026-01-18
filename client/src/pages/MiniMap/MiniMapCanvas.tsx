import React, { useEffect, useContext } from 'react';
import { Canvas, useCanvas } from '../../services/canvas';
import GAMECONFIG from '../../game/gameConfig';
import { GameContext, StoreContext } from '../../App';
import VillageEntity from '../../game/entities/VillageEntity';
import ArmyEntity from '../../game/entities/ArmyEntity';
import useSprites from '../../hooks/useSprites';
import villageBackground from '../../assets/img/background/villageBackground.png';

const MINIMAP_FIELD = 'minimap-field';
const SIZE = GAMECONFIG.MINIMAP_SIZE;
const RADIUS = GAMECONFIG.MINIMAP_RADIUS;

interface MiniMapCanvasProps {
    onMapClick: () => void;
}

let canvas: Canvas | null = null;
const dummy = () => {};

const background = new Image();
background.src = villageBackground;

const MiniMapCanvas: React.FC<MiniMapCanvasProps> = ({ onMapClick }) => {
    const game = useContext(GameContext);
    const store = useContext(StoreContext);
    const [[spritesImage], getSprite] = useSprites();
    const CanvasRef = useCanvas(render);
    const globalMap = game.getGlobalMap();

    const drawSprites = (canvas: Canvas, item: ArmyEntity | VillageEntity, x: number, y: number, scaleFactor: number = 0.5) => {
        item.sprites.forEach((sprite) => {
            const spriteData = getSprite(sprite);
            if (spriteData && spritesImage) {
                canvas.contextV.drawImage(
                    spritesImage,
                    spriteData[0], spriteData[1],
                    spriteData[2], spriteData[2],
                    x - (spriteData[2] * scaleFactor) / 2, 
                    y - (spriteData[2] * scaleFactor) / 2,
                    spriteData[2] * scaleFactor, 
                    spriteData[2] * scaleFactor
                );
            }
        });
    };

    function worldToMiniMap(wx: number, wy: number, cx: number, cy: number) {
        const dx = wx - cx;
        const dy = wy - cy;
        if (Math.abs(dx) > RADIUS || Math.abs(dy) > RADIUS) return null;

        const scale = SIZE / (RADIUS * 2);
        return {
            x: SIZE / 2 + dx * scale,
            y: SIZE / 2 + dy * scale,
        };
    }

    function render(FPS: number) {
        if (!canvas || !spritesImage) return;

        const ctx = canvas.contextV;
        canvas.clear();

        const mapData = globalMap.getMap();
        const villages = mapData.villages;
        const armies = mapData.armies;

        const user = store.getUser();

        const playerVillage = villages.find(v => v.name === user?.name);

        console.log('USER:', user);
        console.log('FOUND VILLAGE:', playerVillage);
        console.log('ALL VILLAGES:', villages);
        
        if (!playerVillage) return;

        const cx = playerVillage.coords.x;
        const cy = playerVillage.coords.y;

        const time = Date.now() / 1000; 
        const PULSE_RADIUS = 5 + Math.sin(time * 5) * 3.5;

        if (background.complete) {
            ctx.drawImage(background, 0, 0, SIZE, SIZE*5);
        }

        drawSprites(canvas, playerVillage, SIZE / 2, SIZE / 2, 0.6);

        armies.forEach(army => {
            const pos = worldToMiniMap(army.coords.x, army.coords.y, cx, cy);

            if (pos) {
                ctx.save();
            
                ctx.shadowColor = '#ec0a0aff';
                ctx.shadowBlur = PULSE_RADIUS;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                drawSprites(canvas!, army, pos.x, pos.y, 0.5);

                ctx.restore();
            }
        }); 

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, SIZE, SIZE);

        canvas.render();
    }   

    useEffect(() => {
        canvas = CanvasRef({
            parentId: MINIMAP_FIELD,
            WIDTH: SIZE,
            HEIGHT: SIZE,
            WINDOW: { LEFT: 0, TOP: 0, WIDTH: 1, HEIGHT: 1 },
            callbacks: {
                mouseMove: dummy,
                mouseDown: dummy,
                mouseUp: dummy,
                mouseRightClickDown: dummy,
                mouseClick: onMapClick,
                mouseLeave: dummy,
                mouseWheel: dummy,
                mouseMiddleDown: dummy,
                mouseMiddleUp: dummy,
                keyDown: dummy,
            },
        });

        if (canvas) {
            canvas.context.imageSmoothingEnabled = false;
            canvas.contextV.imageSmoothingEnabled = false;
        }

        return () => {
            canvas?.destructor();
            canvas = null;
        };
    }, [CanvasRef, onMapClick]);

    return (
        <div className="MiniMapCanvas">
            <div
                id={MINIMAP_FIELD}
                className={MINIMAP_FIELD}
                style={{
                    width: SIZE,
                    height: SIZE,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}
            />
        </div>
    );
};

export default MiniMapCanvas;