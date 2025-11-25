import { TPoint } from "../../config";
import Unit from "../../game/entities/Unit";
import Game from "../../game/Game";
import { TUnit } from "../../services/server/types";

export default class UnitPreview {
    private isActive = false;
    private unitType = '';
    private unitTypeId = 0;
    private unitHp = 50;
    private gridPosition: TPoint = { x: 0, y: 0 };
    private canPlace = false;
    private game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    public activate(unitType: string, unitTypeId: number, hp: number): void {
        this.isActive = true;
        this.unitType = unitType;
        this.unitTypeId = unitTypeId;
        this.unitHp = hp;
    }

    public deactivate(): void {
        this.isActive = false;
        this.unitType = '';
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
        return this.isWithinBounds(occupiedMatrix) && this.isCellEmpty(occupiedMatrix);
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

    public getRenderData() {
        if (!this.isActive) return null;

        return {
            gridPosition: this.gridPosition,
            canPlace: this.canPlace,
            unitType: this.unitType
        };
    }

    public tryPlace(): Unit | null {
        if (!this.isActive || !this.canPlace) return null;

        const unitData: TUnit = {
            id: 0,
            typeId: this.unitTypeId,
            villageId: 0,
            x: this.gridPosition.x,
            y: this.gridPosition.y,
            currentHp: this.unitHp,
            level: 1,
            type: this.unitType
        };

        const unit = new Unit(unitData, this.game);
        this.deactivate();
        
        return unit;
    }
}