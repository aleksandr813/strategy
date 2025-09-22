import { TPoint } from "../config";

export default class Build {
    hp = 100;
    sprite = 1;
    size = 1;
    points:TPoint[] = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
    constructor(x:number, y:number) {
        this.points = [{x: x, y: y}, {x: x+1, y: y}, {x: x, y: y+1}, {x: x+1, y: y+1}];
    }
}
/*
 Тут реализация здания такая, что указывается только нижний левый угол, а не 4 клетки, которые оно занимает. Пример:
 x1 = 0
 y1 = 0
 [[x1, y1], [x1, y1+1],[x1+1, y1], [x1+1, y1+1]]
*/