import { TPoint } from "../../config";

export default class BuildingPreview {
    private isActive = false;
    private buildingTypeId = 0;
    private buildingHp = 0;
    private gridPosition: TPoint = { x: 0, y: 0 };
    private canPlace = false;
    private BUILDING_SIZE: number = 2;

    public activate(buildingTypeId: number, hp: number, size: number): void {
        this.isActive = true;
        this.buildingTypeId = buildingTypeId;
        this.buildingHp = hp;
        this.canPlace = false;
        this.BUILDING_SIZE = size;
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

    public getBuildingTypeId(): number {
        return this.buildingTypeId;
    }

    public getPlacementPosition(): TPoint {
        return { ...this.gridPosition };
    }

    public getCanPlace(): boolean {
        return this.canPlace;
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
        return this.isWithinBounds(occupiedMatrix) && this.isCellsEmpty(occupiedMatrix);
    }

    private isWithinBounds(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;
        return x >= 0 && y >= 0 && 
               x + this.BUILDING_SIZE <= occupiedMatrix[0].length && 
               y + this.BUILDING_SIZE <= occupiedMatrix.length;
    }

    private isCellsEmpty(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;
        
        for (let dy = 0; dy < this.BUILDING_SIZE; dy++) {
            for (let dx = 0; dx < this.BUILDING_SIZE; dx++) {
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
            canPlace: this.canPlace,
            size: this.BUILDING_SIZE
        };
    }

    public getPlacementData() {
        if (!this.isActive) return null;

        return {
            typeId: this.buildingTypeId,
            position: { ...this.gridPosition },
            canPlace: this.canPlace
        };
    }
}