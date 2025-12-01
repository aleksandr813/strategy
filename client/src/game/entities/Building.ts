import { TPoint } from "../../config";
import { TBuilding as TBuildingType, BuildingTypeID } from "../../services/server/types";
import { Entity } from "./Entity";

export default class Building extends Entity {
    typeId: number;
    type: string;
    coords: TPoint[] = [];
    hp: number;
    maxHp: number;
    level: number;
    size: number; 
    sprites: number[];
    isselected: boolean = false; 
    unlockLevel: number; 

    private static SPRITE_MAP: Record<BuildingTypeID, number[]> = {
        [BuildingTypeID.TownHall]: [1, 2, 3, 4], // TownHall (Ратуша)
        [BuildingTypeID.Mine]:     [5, 6, 7, 8], // Mine (Шахта)
        [BuildingTypeID.Tower]:     [9, 10, 11, 12],
        [BuildingTypeID.Wall]:     [13],
        [BuildingTypeID.Kazarma]:  [14, 15, 16 ,17],
    };


    constructor(id:number, type: string, hp:number, maxHp:number, level:number, size:number, typeId:number, x:number, y:number, unlocklevel: number) {
        const spriteSet = Building.SPRITE_MAP[typeId as BuildingTypeID];
        const coords = [
            { x: Number(x), y: Number(y) },
            { x: Number(x) + 1, y: Number(y) },
            { x: Number(x), y: Number(y) + 1 },
            { x: Number(x) + 1, y: Number(y) + 1 },
        ];
        
        super(id, coords, spriteSet);
        
        this.type = type;
        this.hp = hp;
        this.maxHp = maxHp;
        this.level = level;
        this.size = 2; 
        this.typeId = typeId;
        this.unlockLevel = unlocklevel;
        
        this.sprites = spriteSet;
        this.coords = coords;
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