import { TPoint } from "../../config";

export default class ArmyEntity {
    id: number;
    coords:TPoint;
    sprites: number[] = [24];
    speed: number = 1;

    constructor(id:number, coords:TPoint) {
        this.id = id;
        this.coords = coords;    }
}