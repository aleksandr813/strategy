import { TPoint } from "../../config";

export default class VillageEntity {
    id: number;
    coords:TPoint;
    sprites: number[] = [23];
    name: string;
    isSelected: boolean = false;

    constructor(id:number, coords:TPoint, name:string) {
        this.id = id;
        this.coords = coords;
        this.name = name;
    }

    selected():void{
        this.isSelected =true;
    }

    deselected():void{
        this.isSelected =false;
    }
}