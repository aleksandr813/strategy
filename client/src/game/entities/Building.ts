import { TPoint } from "../../config";
import { TBuildingType, BuildingTypeID } from "../../services/server/types";

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
    damage: number = 0;
    range: number = 0;
    upgradeCost: number = 0;
    typeData: TBuildingType | null = null;

    private static SPRITE_MAP: Record<BuildingTypeID, number[]> = {
        [BuildingTypeID.TownHall]: [1, 2, 3, 4],
        [BuildingTypeID.Mine]: [5, 6, 7, 8],
        [BuildingTypeID.Kazarma]: [14, 15, 16, 17],
        [BuildingTypeID.Wall]: [26],
        [BuildingTypeID.Tower]: [9, 10, 11, 12],
        [BuildingTypeID.VietnamTrap]: [37],
        [BuildingTypeID.Cannon]: [103],
        [BuildingTypeID.Gates]: [91, 92],
    };


    private static WALL_SPRITES: Record<number, number> = {
        21: 21, // со всех 4 сторон
        34: 34, // слева, снизу и сверху
        33: 33, // справа, слева и сверху
        32: 32, // справа, снизу и сверху
        31: 31, // справа, слева и снизу
        30: 30, // слева и сверху
        29: 29, // справа и сверху
        28: 28, // слева и снизу
        27: 27, // справа и слева
        26: 26, // сверху и снизу или нет
        19: 19 // справа снизу
    };


    constructor(id:number, type: string, hp:number, maxHp:number, level:number, size:number, typeId:number, x:number, y:number, unlocklevel: number, wallSpriteIndex?: number, typeData?: TBuildingType) {
        this.id = id;
        this.type = type;
        this.hp = hp;
        this.maxHp = 0;
        this.level = level;
        this.size = size; 
        this.typeId = typeId;
        this.unlockLevel = unlocklevel;
        
        if (typeData) {
            this.typeData = typeData;
            this.updateStats();
        }
        
        if (typeId === BuildingTypeID.Wall && wallSpriteIndex !== undefined) {
            this.sprites = [Building.WALL_SPRITES[wallSpriteIndex] || 26];
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

    public updateStats(): void {
        if (!this.typeData) {
            return;
        }

        switch (this.level) {
            case 1:
                this.maxHp = this.typeData.hpLevel1;
                this.damage = this.typeData.damageLevel1;
                this.range = this.typeData.rangeAttackLevel1;
                this.upgradeCost = this.typeData.priceLevel2;
                break;
            case 2:
                this.maxHp = this.typeData.hpLevel2;
                this.damage = this.typeData.damageLevel2;
                this.range = this.typeData.rangeAttackLevel2;
                this.upgradeCost = this.typeData.priceLevel3;
                break;
            case 3:
                this.maxHp = this.typeData.hpLevel3;
                this.damage = this.typeData.damageLevel3;
                this.range = this.typeData.rangeAttackLevel3;
                this.upgradeCost = Number.MAX_VALUE;
                break;
        }
    }

    public setTypeData(typeData: TBuildingType): void {
        this.typeData = typeData;
        this.updateStats();
    }

    public updateWallSprite(wallSpriteIndex: number): void {
        if (this.typeId === BuildingTypeID.Wall) {
            this.sprites = [Building.WALL_SPRITES[wallSpriteIndex] || 26];
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