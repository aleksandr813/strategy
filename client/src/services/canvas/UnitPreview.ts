import CONFIG from "../../config";
import { TPoint } from "../../config";
import Unit from "../../game/entities/Unit";
import { TUnit } from "../../services/server/types";

const { SPRITE_SIZE } = CONFIG;

export default class UnitPreview {
    private isActive: boolean = false;
    private unitType: string = '';
    private unitTypeId: number = 0;
    private unitHp: number = 50;
    private mousePosition: TPoint = { x: 0, y: 0 };
    private gridPosition: TPoint = { x: 0, y: 0 };
    private canPlace: boolean = false;

    constructor() {
        this.isActive = false;
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

    public update(x: number, y: number, occupiedMatrix: number[][]): void {
        if (!this.isActive) return;

        this.mousePosition = { x, y };
        this.gridPosition = {
            x: Math.floor(x),
            y: Math.floor(y)
        };

        this.canPlace = this.checkCanPlace(occupiedMatrix);
    }

    private checkCanPlace(occupiedMatrix: number[][]): boolean {
        const { x, y } = this.gridPosition;

        // проверка границ карты
        if (x < 0 || y < 0 || x >= occupiedMatrix[0].length || y >= occupiedMatrix.length) {
            return false;
        }

        const cell = { x: x, y: y };

        if (occupiedMatrix[cell.y][cell.x] !== 0) {
            return false;
        }

        return true;
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
        if (!this.isActive || !this.canPlace) {
            return null;
        }

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

        const unit = new Unit(unitData);

        this.deactivate();
        return unit;
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
}