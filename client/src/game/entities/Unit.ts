import EasyStar from 'easystarjs';
import { TPoint } from "../../config";
import { TUnit, UnitTypeID } from "../../services/server/types";

export default class Unit {
    id: number;
    typeId: number;
    type: string;
    cords: TPoint;
    hp: number;
    maxHp: number;
    level: number;
    sprites: number[];

    private static SPRITE_MAP: Record<UnitTypeID, number[]> = {
        [UnitTypeID.Knight]: [21],
        [UnitTypeID.Spearman]: [22],
        [UnitTypeID.Berserk]: [30],
        [UnitTypeID.Paladin]: [31],
        [UnitTypeID.Guardian]: [29],
        [UnitTypeID.Archer]: [24],
        [UnitTypeID.Crossbowman]: [23],
        [UnitTypeID.Sorcerer]: [25],
        [UnitTypeID.Summoner]: [27],
        [UnitTypeID.Golem]: [26],
        [UnitTypeID.Swordman]: [28]
    };
    
    isSelected: boolean = false;
    moveIntervalId: NodeJS.Timeout | null = null;
    
    constructor(data: TUnit, easyStar: EasyStar.js) {
        this.id = data.id;
        this.typeId = data.typeId;
        this.type = data.type;
        this.hp = data.currentHp;
        this.maxHp = data.currentHp; 
        this.level = data.level;

        const spriteSet = Unit.SPRITE_MAP[data.typeId as UnitTypeID];
        this.sprites = spriteSet || [28];

        this.cords = { x: data.x, y: data.y };
    }

    updateSelection(isSelected: boolean): void {
        this.isSelected = isSelected;
    }
}