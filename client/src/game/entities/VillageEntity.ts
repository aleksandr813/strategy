import { TPoint } from "../../config";

export default class VillageEntity {
    id: number;
    coords:TPoint;
    sprites: number[] = [43];
    name: string;

    constructor(id:number, coords:TPoint, name:string) {
        this.id = id;
        this.coords = coords;
        this.name = name;
    }
}