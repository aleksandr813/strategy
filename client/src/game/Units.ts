import { TPoint } from "../config";

export default class Unit {
    hp = 100;
    damage = 100;
    dx = 0;
    dy = 0;
    sx = 0;
    sy = 0;
    size = 1;
    constructor(x: number, y: number) {
        this.dx = x;
        this.dy = y;
    }
}