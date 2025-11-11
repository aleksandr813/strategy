import { TBuilding as BuildingData, BuildingType, BuildingTypeID } from "../../services/server/types";
import { TPoint } from "../../config";

export default class Building {
    id: number;
    typeId: number;
    villageId: number;
    type: string;
    cords:TPoint[] = [];
    hp: number;
    maxHp: number;
    level: number;
    size: number; 
    sprites: number[];
    isselected: boolean = false;  

    private static SPRITE_MAP: Record<BuildingTypeID, number[]> = {
        [BuildingTypeID.TownHall]: [7, 8, 9, 10], // TownHall (Ратуша)
        [BuildingTypeID.Mine]:     [11, 12, 13, 14], // Mine (Шахта)
        [BuildingTypeID.Kazarma]:     [11, 12, 13, 14],
        [BuildingTypeID.Wall]:     [11, 12, 13, 14],
        [BuildingTypeID.Tower]:     [11, 12, 13, 14],
    };


    constructor(id:number, type: string, hp:number, maxHp:number, level:number, size:number, typeId:number, x:number, y:number, villageId:number) {
        this.id = id;
        this.type = type;
        this.hp = hp;
        this.maxHp = maxHp;
        this.level = level;
        this.size = 2; 
        this.typeId = typeId;
        this.villageId = villageId;
        
        const spriteSet = Building.SPRITE_MAP[typeId as BuildingTypeID];
        this.sprites = spriteSet;

        this.cords = [
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
