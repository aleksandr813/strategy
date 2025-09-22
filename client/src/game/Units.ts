import { TPoint } from "../config";

export default class Unit {
    hp = 100;
    damage = 100;
    cords:TPoint
    sx = 0;
    sy = 0;
    size = 1;
    sprite = 1;
    constructor(x: number, y: number) {
        this.cords = {x: x, y: y};
    }
}