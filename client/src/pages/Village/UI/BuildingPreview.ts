import CONFIG from '../../../config';
import { TPoint } from '../../../config';
import Building from '../../../game/Buildings/Building';

const { SPRITE_SIZE } = CONFIG;

export default class BuildingPreview {
    private isActive: boolean = false;
    private buildingType: string = '';
    private buildingTypeId: number = 0;
    private buildingHp: number = 100;
    private mousePosition: TPoint = { x: 0, y: 0 };
    private gridPosition: TPoint = { x: 0, y: 0 };
    private canPlace: boolean = false;

    constructor() {
        this.isActive = false;
    }

    public activate(buildingType: string, buildingTypeId: number, hp: number): void {
        this.isActive = true;
        this.buildingType = buildingType;
        this.buildingTypeId = buildingTypeId;
        this.buildingHp = hp;
    }

    public deactivate(): void {
        this.isActive = false;
        this.buildingType = '';
        this.canPlace = false;
    }

    public isActiveStatus(): boolean {
        return this.isActive;
    }

    public update(x: number, y: number, occupiedMatrix: number[][]): void {
        if (!this.isActive) return;

        this.mousePosition = { x, y };
        this.gridPosition = {
            x: Math.floor(x),
            y: Math.floor(y)
        };

        // Проверяем, можно ли разместить здание (2x2)
        this.canPlace = this.checkCanPlace(occupiedMatrix);
    }

    private checkCanPlace(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;

        // Проверка границ карты
        if (x < 0 || y < 0 || x + 1 >= occupiedMatrix.length || y + 1 >= occupiedMatrix[0].length) {
            return false;
        }

        // Проверка всех 4 клеток здания (2x2)
        const cells = [
            { x: x, y: y },
            { x: x + 1, y: y },
            { x: x, y: y + 1 },
            { x: x + 1, y: y + 1 }
        ];

        for (const cell of cells) {
            if (occupiedMatrix[cell.x][cell.y] !== 0) {
                return false;
            }
        }

        return true;
    }


    public getRenderData() {
        if (!this.isActive) return null;

        return {
            gridPosition: this.gridPosition,
            canPlace: this.canPlace,
            buildingType: this.buildingType
        };
    }

    public tryPlace(): Building | null {
        if (!this.isActive || !this.canPlace) {
            return null;
        }

        const building = new Building(this.gridPosition.x, this.gridPosition.y);
        building.hp = this.buildingHp;
        building.MAX_HP = this.buildingHp;
        
        this.deactivate();
        return building;
    }


    public getBuildingTypeId(): number {
        return this.buildingTypeId;
    }

    public getPlacementPosition(): TPoint {
        return this.gridPosition;
    }
}