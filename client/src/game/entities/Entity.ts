import { TPoint } from "../../config";

export class Entity {
    id: number;
    coords: TPoint | TPoint[];
    sprites: number[];

    constructor(
        id: number,
        coords: TPoint| TPoint[] ,
        sprites: number[],

    ) {
        this.id = id;
        this.coords = coords;
        this.sprites = sprites;
    }
}