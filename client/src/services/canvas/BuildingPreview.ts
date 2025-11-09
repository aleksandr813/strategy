import CONFIG from '../../config';
import { TPoint } from '../../config';
import Building from '../../game/Entities/Building';

const { SPRITE_SIZE } = CONFIG;

interface BuildingTypeData {
    id: number;
    type: string;
    name: string;
    hp: number;
    price: number;
    sprite: number;
}

interface RenderData {
    gridPosition: TPoint;
    canPlace: boolean;
    buildingType: string;
}

export default class BuildingPreview {
    private isActive = false;
    private buildingType = '';
    private buildingTypeId = 0;
    private buildingHp = 100;
    private gridPosition: TPoint = { x: 0, y: 0 };
    private canPlace = false;

    // Константа для размера здания (можно вынести в конфиг)
    private static readonly BUILDING_SIZE = 2;

    public activate(buildingType: string, buildingTypeId: number, hp: number): void {
        this.isActive = true;
        this.buildingType = buildingType;
        this.buildingTypeId = buildingTypeId;
        this.buildingHp = hp;
        this.canPlace = false;
    }

    public deactivate(): void {
        this.isActive = false;
        this.buildingType = '';
        this.buildingTypeId = 0;
        this.canPlace = false;
    }

    public isActiveStatus(): boolean {
        return this.isActive;
    }

    public update(x: number, y: number, occupiedMatrix: number[][]): void {
        if (!this.isActive) return;

        // Обновляем позицию на сетке
        this.gridPosition = {
            x: Math.floor(x),
            y: Math.floor(y)
        };

        // Проверяем возможность размещения
        this.canPlace = this.checkCanPlace(occupiedMatrix);
    }

    private checkCanPlace(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;
        const size = BuildingPreview.BUILDING_SIZE;

        // Проверка границ карты
        if (x < 0 || y < 0 || 
            x + size > occupiedMatrix[0].length || 
            y + size > occupiedMatrix.length) {
            return false;
        }

        // Проверка всех клеток здания (2x2)
        for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
                if (occupiedMatrix[y + dy][x + dx] !== 0) {
                    return false;
                }
            }
        }

        return true;
    }

    public getRenderData(): RenderData | null {
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

        const building = new Building(
            0, // id
            "Preview Building", // name
            this.buildingHp, // hp
            this.buildingHp, // maxHp
            1, // level
            1,
            this.buildingTypeId, // typeId
            this.gridPosition.x,
            this.gridPosition.y
        );

        this.deactivate();
        return building;
    }

    public getBuildingTypeId(): number {
        return this.buildingTypeId;
    }

    public getPlacementPosition(): TPoint {
        return { ...this.gridPosition };
    }

    public getCanPlace(): boolean {
        return this.canPlace;
    }
}