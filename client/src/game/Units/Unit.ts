import { TPoint } from "../../config";

export default class Unit {
    hp = 100;
    damage = 100;
    cords:TPoint;
    destination:TPoint;
    sx = 0;
    sy = 0;
    sprite = 2
    isHighlighted = false;
    constructor(x: number, y: number) {
        this.cords = {x: x, y: y};
        this.destination = {x: x, y: y};
    }
}