import CONFIG from '../../config';
import { TPoint } from '../../config';
import Building from '../../game/entities/Building';

const { SPRITE_SIZE } = CONFIG;

export default class BuildingPreview {
    private isActive = false;
    private buildingTypeId = 0;
    private buildingHp = 0;
    private gridPosition: TPoint = { x: 0, y: 0 };
    private canPlace = false;

    private static readonly BUILDING_SIZE = 2;

    public activate(buildingTypeId: number, hp: number): void {
        this.isActive = true;
        this.buildingTypeId = buildingTypeId;
        this.buildingHp = hp;
        this.canPlace = false;
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

    public deactivate(): void {
        this.isActive = false;
        this.buildingTypeId = 0;
        this.buildingHp = 0;
        this.canPlace = false;
    }

    public isActiveStatus(): boolean {
        return this.isActive;
    }

    public update(x: number, y: number, occupiedMatrix: number[][]): void {
        if (!this.isActive) return;

        this.gridPosition = {
            x: Math.floor(x),
            y: Math.floor(y)
        };

        this.canPlace = this.checkCanPlace(occupiedMatrix);
    }

    private checkCanPlace(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;
        const size = BuildingPreview.BUILDING_SIZE;

        // Проверка границ
        if (x < 0 || y < 0 || 
            x + size > occupiedMatrix[0].length || 
            y + size > occupiedMatrix.length) {
            return false;
        }

        // Проверка занятости клеток
        for (let dy = 0; dy < size; dy++) {
            for (let dx = 0; dx < size; dx++) {
                if (occupiedMatrix[y + dy][x + dx] !== 0) {
                    return false;
                }
            }
        }

        return true;
    }

    public getRenderData() {
        if (!this.isActive) return null;

        return {
            gridPosition: this.gridPosition,
            canPlace: this.canPlace
        };
    }

    public getPlacementData(): { typeId: number; position: TPoint; canPlace: boolean } | null {
        if (!this.isActive) return null;

        return {
            typeId: this.buildingTypeId,
            position: { ...this.gridPosition },
            canPlace: this.canPlace
        };
    }
}