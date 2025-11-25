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
    isselected: boolean = false;  

    private static SPRITE_MAP: Record<BuildingTypeID, number[]> = {
        [BuildingTypeID.TownHall]: [1, 2, 3, 4], // TownHall (Ратуша)
        [BuildingTypeID.Mine]:     [5, 6, 7, 8], // Mine (Шахта)
        [BuildingTypeID.Tower]:     [9, 10, 11, 12],
        [BuildingTypeID.Wall]:     [13],
        [BuildingTypeID.Kazarma]:  [14, 15, 16 ,17],
    };


    constructor(id:number, type: string, hp:number, maxHp:number, level:number, size:number, typeId:number, x:number, y:number) {
        this.id = id;
        this.type = type;
        this.hp = hp;
        this.maxHp = maxHp;
        this.level = level;
        this.size = 2; 
        this.typeId = typeId;

        
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

    selected():void{
        this.isselected =true;
    }

    deselected():void{
        this.isselected =false;
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
