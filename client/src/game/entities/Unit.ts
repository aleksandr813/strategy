import EasyStar from 'easystarjs';
import { SPRITE_MAP, UnitTypeID, getUnitSprites } from "../gameConfig";
import { TPoint } from "../../config";
import { TUnit } from "../../services/server/types";

export default class Unit {
    id: number;
    typeId: UnitTypeID;
    type: string;
    cords: TPoint;
    hp: number;
    maxHp: number;
    level: number;
    sprites: number[];

    
    
    isSelected: boolean = false;
    moveIntervalId: NodeJS.Timeout | null = null;
    
    constructor(data: TUnit, easyStar: EasyStar.js) {
        this.id = data.id;
        this.typeId = data.typeId as UnitTypeID;
        this.type = data.type;
        this.hp = data.currentHp;
        this.maxHp = data.currentHp; 
        this.level = data.level;

        this.sprites = getUnitSprites(this.typeId);

        this.cords = { x: data.x, y: data.y };
    }

    updateSelection(isSelected: boolean): void {
        this.isSelected = isSelected;
    }
}