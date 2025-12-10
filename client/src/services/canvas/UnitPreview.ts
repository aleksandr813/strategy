import { TPoint } from "../../config";
import { TUnit } from "../../services/server/types";
import Unit from "../../game/entities/Unit";
import Game from "../../game/Game";

export default class UnitPreview {
    private isActive = false;
    private unitTypeId = 0;
    private gridPosition: TPoint = { x: 0, y: 0 };
    private canPlace = false;
    private game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    public activate(unitTypeId: number): void {
        this.isActive = true;
        this.unitTypeId = unitTypeId;
    }

    public deactivate(): void {
        this.isActive = false;
        this.canPlace = false;
    }

    public isActiveStatus(): boolean {
        return this.isActive;
    }

    public getUnitTypeId(): number {
        return this.unitTypeId;
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
        return this.isWithinBounds(occupiedMatrix) && this.isCellEmpty(occupiedMatrix) && this.isBorders();
    }

    private isWithinBounds(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;
        return x >= 0 && y >= 0 && 
               x < occupiedMatrix[0].length && 
               y < occupiedMatrix.length;
    }

    private isCellEmpty(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;
        return occupiedMatrix[y][x] === 0;
    }

    private isBorders(): boolean {
        const x = this.gridPosition.x;

        if (x > 29) {
            return false;
        }

        return true;
    }

    public getRenderData() {
        if (!this.isActive) return null;

        return {
            gridPosition: this.gridPosition,
            canPlace: this.canPlace,
        };
    }

    public tryPlace(): boolean | null {
        if (!this.isActive || !this.canPlace) return null;

        this.deactivate();
        
        return true;
    }
}