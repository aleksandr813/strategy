import { TPoint } from "../../config";

export default class VillageEntity {
    id: number;
    coords:TPoint;
    sprites: number[] = [43];

    constructor(id:number, coords:TPoint) {
        this.id = id;
        this.coords = coords;
    }
}