import { TPoint } from "../../config";

const MAX_HP_UNIT = 100;

export default class Unit {
    hp = 50;
    maxHp = MAX_HP_UNIT;
    damage = 100;
    cords:TPoint;
    destination:TPoint;
    sx = 0;
    sy = 0;
    sprite = 2
    isSelected: boolean = false;
    
    constructor(x: number, y: number) {
        this.cords = {x: x, y: y};
        this.destination = {x: x, y: y};
    }

    updateSelection(isSelected: boolean): void {
        this.isSelected = isSelected;
    }
}