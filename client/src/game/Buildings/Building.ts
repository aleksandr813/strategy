import { Building as BuildingData, BuildingType } from "../../services/server/types";

export default class Building {
    id: number;
    type: BuildingType;
    cords: { x: number, y: number }[];
    hp: number;
    maxHp: number;
    level: number;
    size: number; 
    sprites: number[]; 

    constructor(data: BuildingData, type: BuildingType) {
        this.id = Number(data.id);
        this.type = type;
        this.hp = Number(data.current_hp);
        this.maxHp = Number(type.hp);
        this.level = Number(data.level);
        this.size = 2; 
        this.sprites = Array(this.size * this.size).fill(Number(type.sprite));

        this.cords = [
            { x: Number(data.x), y: Number(data.y) },
            { x: Number(data.x) + 1, y: Number(data.y) },
            { x: Number(data.x), y: Number(data.y) + 1 },
            { x: Number(data.x) + 1, y: Number(data.y) + 1 },
        ];
    }

    takeDamage(amount: number) {
        this.hp = Math.max(0, this.hp - amount);
    }
}
