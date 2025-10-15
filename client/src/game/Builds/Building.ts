import { TPoint } from "../../config";
import { TBuildingFullData } from "../../services/server/Server";

export default class Build {
    MAX_HP: number;
    hp: number;
    type: string; 
    sx = 0;
    sy = 0;
    size = 2; 
    sprites: number[] 
    cords: TPoint[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];

    private static typeMap: Record<string, string> = {
        '1': 'Ratusha',
        '2': 'Mine',
        '3': 'Shooting tower',
    };

    private static hpMap: Record<string, number> = {
        '1': 100, // Ratusha
        '2': 100, // Mine
        '3': 100, // Shooting tower
    };

    constructor(data: TBuildingFullData) {
        const typeId = (data as any).type_id;
        this.type = Build.typeMap[typeId] || 'Unknown';
        this.MAX_HP = Build.hpMap[typeId] || 100;
        this.hp = data.current_hp;

        console.log("Создано здание:", this.type, "HP:", this.hp, "/", this.MAX_HP);

        const x = Number(data.x);
        const y = Number(data.y);
        
        this.cords = [
            { x: x,     y: y },     // верхний левый
            { x: x + 1, y: y },     // верхний правый  
            { x: x,     y: y + 1 }, // нижний левый
            { x: x + 1, y: y + 1 }  // нижний правый
        ];

        this.sprites = this.getSpritesByType(this.type);
    }
    
    private getSpritesByType(type: string): number[] {
        switch (type) {
            case 'Ratusha': 
                return [7, 8, 9, 10];
            case 'Mine': 
                return [11, 12, 13, 14];
            case 'Shooting tower':
                return [15, 16, 17, 18];
            default:
                return [1, 1, 1, 1]; 
        }
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        console.log(`Здание ${this.type} получило урон ${amount}, HP теперь: ${this.hp}/${this.MAX_HP}`);
    }
}
