import { TPoint } from "../../config";
import { TBuilding as TBuildingType, BuildingTypeID } from "../../services/server/types";

export default class Building {
    id: number;
    typeId: number;
    type: string;
    coords:TPoint[] = [];
    hp: number;
    maxHp: number;
    level: number;
    size: number; 
    sprites: number[];
    isSelected: boolean = false; 
    unlockLevel: number; 

    private static SPRITE_MAP: Record<BuildingTypeID, number[]> = {
        [BuildingTypeID.TownHall]: [1, 2, 3, 4], // TownHall (Ратуша)
        [BuildingTypeID.Mine]:     [5, 6, 7, 8], // Mine (Шахта)
        [BuildingTypeID.Tower]:     [9, 10, 11, 12],
        [BuildingTypeID.Wall]:     [81],
        [BuildingTypeID.Kazarma]:  [14, 15, 16 ,17],
        [BuildingTypeID.Gates]: [91, 92]
    };

    private static WALL_SPRITES: Record<number, number> = {
        41: 41, // со всех 4 сторон
        90: 90, // слева, снизу и сверху
        89: 89, // справа, слева и сверху
        88: 88, // справа, снизу и сверху
        87: 87, // справа, слева и снизу
        86: 86, // слева и сверху
        85: 85, // справа и сверху
        84: 84, // справа и снизу
        83: 83, // слева и снизу
        82: 82, // справа и слева
        81: 81, // сверху и снизу или нет
    };


    constructor(id:number, type: string, hp:number, maxHp:number, level:number, size:number, typeId:number, x:number, y:number, unlocklevel: number, wallSpriteIndex?: number) {
        this.id = id;
        this.type = type;
        this.hp = hp;
        this.maxHp = maxHp;
        this.level = level;
        this.size = size; 
        this.typeId = typeId;
        this.unlockLevel = unlocklevel;

        
        if (typeId === BuildingTypeID.Wall && wallSpriteIndex !== undefined) {
            this.sprites = [Building.WALL_SPRITES[wallSpriteIndex] || 81];
            this.coords = [
                { x: Number(x), y: Number(y) },
            ];
        }else if(typeId === BuildingTypeID.Gates){
            const spriteSet = Building.SPRITE_MAP[typeId as BuildingTypeID];
            this.sprites = [91];
            this.coords = [
                // Верхний Левый тайл здания на карте
                { x: Number(x), y: Number(y) },
                // Верхний Правый
                { x: Number(x) + 1, y: Number(y) },
                // Нижний Левый
                { x: Number(x), y: Number(y) + 1 },
                // Нижний Правый
                { x: Number(x) + 1, y: Number(y) + 1 },
            ];
        }
        else {
            const spriteSet = Building.SPRITE_MAP[typeId as BuildingTypeID];
            this.sprites = spriteSet;

            this.coords = [
                // Верхний Левый тайл здания на карте
                { x: Number(x), y: Number(y) },
                // Верхний Правый
                { x: Number(x) + 1, y: Number(y) },
                // Нижний Левый
                { x: Number(x), y: Number(y) + 1 },
                // Нижний Правый
                { x: Number(x) + 1, y: Number(y) + 1 },
            ];
        }
        
    }

    public updateWallSprite(wallSpriteIndex: number): void {
        if (this.typeId === BuildingTypeID.Wall) {
            this.sprites = [Building.WALL_SPRITES[wallSpriteIndex] || 81];
        }
    }

    public updateGateSprite(gateSpriteId: number): void {
        if (this.typeId === BuildingTypeID.Gates) {
            this.sprites = [gateSpriteId]; 
        }
    }

    selected():void{
        this.isSelected =true;
    }

    deselected():void{
        this.isSelected =false;
    }

    getInfo(){
        return{
            level: this.level,
            hp: this.hp,
            maxHp: this.maxHp,
            name: this.type
        }
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp < 0) {
            this.hp = 0;
        }
    }
}