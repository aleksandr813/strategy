import EasyStar from 'easystarjs';
import GAMECONFIG from '../gameConfig';
import { SPRITE_MAP, UnitTypeID, getUnitSprites } from "../gameConfig";
import { TPoint } from "../../config";
import { TUnit } from "../../services/server/types";
import Game from '../Game';
import { Entity } from './Entity';

const { GRID_HEIGHT, GRID_WIDTH, MOVE_INTERVAL } = GAMECONFIG

export default class Unit extends Entity {
    typeId: UnitTypeID;
    type: string;
    coords: TPoint;
    hp: number;
    maxHp: number;
    level: number;
    sprites: number[];
    easystar: EasyStar.js;
    game: Game;
    unlockLevel: number;
    
    isSelected: boolean = false;
    moveIntervalId: NodeJS.Timeout | null = null;
    
    private currentPath: TPoint[] | null = null;
    private currentPathIndex: number = 0;
    
    constructor(data: TUnit, game: Game, easystar: EasyStar.js) {
        super(data.id, { x: data.x, y: data.y }, getUnitSprites(data.typeId as UnitTypeID));
        
        this.typeId = data.typeId as UnitTypeID;
        this.type = data.type;
        this.hp = data.currentHp;
        this.maxHp = data.currentHp; 
        this.level = data.level;
        this.unlockLevel = data.unlockLevel;

        this.sprites = getUnitSprites(this.typeId);
        this.coords = { x: data.x, y: data.y };

        this.game = game;
        this.easystar = easystar;
    }

    updateSelection(isSelected: boolean): void {
        this.isSelected = isSelected;
    }

    private clearUnitMovement(): void {
        this.currentPath = null;
        this.currentPathIndex = 0;
    }

    calcPath(destination: TPoint) {
        this.clearUnitMovement();
        
        const matrix = this.game.village.getMatrixForEasyStar(this);
        
        this.easystar.setGrid(matrix);
        this.easystar.setAcceptableTiles([0]);

        this.easystar.findPath(
            this.coords.x, 
            this.coords.y, 
            destination.x, 
            destination.y, 
            (path) => {
                if (path === null || path.length <= 1) {
                    return;
                }

                this.currentPath = path;
                this.currentPathIndex = 1;
            }
        );

        this.easystar.calculate();
    }

    makeStep(): boolean {
        if (!this.currentPath || this.currentPathIndex >= this.currentPath.length) {
            return false;
        }

        const nextStep = this.currentPath[this.currentPathIndex];
        
        const isOccupied = this.game.getUnits().some(unit => 
            unit !== this && 
            unit.coords.x === nextStep.x && 
            unit.coords.y === nextStep.y
        );

        if (isOccupied) {
            const destination = this.currentPath[this.currentPath.length - 1];
            this.calcPath(destination);
            return false;
        }

        this.coords.x = nextStep.x;
        this.coords.y = nextStep.y;
        this.currentPathIndex++;

        return this.currentPathIndex < this.currentPath.length;
    }

    isMoving(): boolean {
        return this.currentPath !== null && this.currentPathIndex < this.currentPath.length;
    }
}