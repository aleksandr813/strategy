import { TPoint } from "../../config";
import { Unit as UnitData, UnitType, UnitTypeID } from "../../services/server/types";


export default class Unit {
    id: number;
    type: UnitType;
    cords:TPoint;
    hp: number;
    maxHp: number;
    level: number;
    sprites: number[];

    private static SPRITE_MAP: Record<UnitTypeID, number[]> = {
        [UnitTypeID.Knight]: [2]
    };
    
    isSelected: boolean = false;
    moveIntervalId: NodeJS.Timeout | null = null;
    
    constructor(data: UnitData, type: UnitType) {
        this.id = Number(data.id);
        this.type = type;
        this.hp = Number(data.currentHp);
        this.maxHp = Number(type.hp);
        this.level = Number(data.level);
        const typeId = Number(type.id);

        const spriteSet = Unit.SPRITE_MAP[typeId as UnitTypeID];
        this.sprites = spriteSet;

        this.cords = { x: Number(data.x), y: Number(data.y) }

        
    }

    updateSelection(isSelected: boolean): void {
        this.isSelected = isSelected;
    }
    
}