import { TPoint } from "../../config";

export default class Build {
    readonly MAX_HP = 100; 
    hp = 100;
    sx = 0;
    sy = 0;
    size = 2;
    sprites = [1, 1, 1, 1]
    cords: TPoint[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];

    constructor(x: number, y: number) {
        this.cords = [{ x: x, y: y }, { x: x + 1, y: y }, { x: x, y: y + 1 }, { x: x + 1, y: y + 1 }];
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp < 0) {
            this.hp = 0;
        }
    }
}