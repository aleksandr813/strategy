import { TPoint } from "../../config";
import Game from "../../game/Game";

const BUILDING_SIZE = 2;

export default class BuildingPreview {
    private isActive = false;
    private buildingTypeId = 0;
    private gridPosition: TPoint = { x: 0, y: 0 };
    private canPlace = false;
    private game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    public activate(buildingTypeId: number): void {
        this.isActive = true;
        this.buildingTypeId = buildingTypeId;
    }

    public deactivate(): void {
        this.isActive = false;
        this.canPlace = false;
    }

    public isActiveStatus(): boolean {
        return this.isActive;
    }

    public getBuildingTypeId(): number {
        return this.buildingTypeId;
    }

    public getPlacementPosition(): TPoint {
        return this.gridPosition;
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
               x + BUILDING_SIZE <= occupiedMatrix[0].length && 
               y + BUILDING_SIZE <= occupiedMatrix.length;
    }

    private isCellsEmpty(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;
        
        for (let dy = 0; dy < BUILDING_SIZE; dy++) {
            for (let dx = 0; dx < BUILDING_SIZE; dx++) {
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

    public tryPlace(): boolean | null {
        if (!this.isActive || !this.canPlace) return null;

        this.deactivate();
        
        return true;
    }
}