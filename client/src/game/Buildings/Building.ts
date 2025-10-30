import { Building as BuildingData, BuildingType, BuildingTypeID } from "../../services/server/types";
import { TPoint } from "../../config";

export default class Building {
    id: number;
    type: BuildingType;
    cords:TPoint[] = [];
    hp: number;
    maxHp: number;
    level: number;
    size: number; 
    sprites: number[];
    isselected: boolean = false;
    villageId:number;  

    private static SPRITE_MAP: Record<BuildingTypeID, number[]> = {
        [BuildingTypeID.TownHall]: [7, 8, 9, 10], // TownHall (Ратуша)
        [BuildingTypeID.Mine]:     [11, 12, 13, 14], // Mine (Шахта)
    };


    constructor(data: BuildingData, type: BuildingType) {
        this.id = Number(data.id);
        this.type = type;
        this.hp = Number(data.current_hp);
        this.maxHp = Number(type.hp);
        this.level = Number(data.level);
        this.size = 2; 
        const typeId = Number(type.id);
        this.villageId = Number(data.village_id)
        
        const spriteSet = Building.SPRITE_MAP[typeId as BuildingTypeID];
        this.sprites = spriteSet;

        this.cords = [
            // Верхний Левый тайл здания на карте
            { x: Number(data.x), y: Number(data.y) },
            // Верхний Правый
            { x: Number(data.x) + 1, y: Number(data.y) },
            // Нижний Левый
            { x: Number(data.x), y: Number(data.y) + 1 },
            // Нижний Правый
            { x: Number(data.x) + 1, y: Number(data.y) + 1 },
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
            name: this.type.name
        }
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp < 0) {
            this.hp = 0;
        }
    }
}
