import EasyStar from 'easystarjs';
import GAMECONFIG from '../gameConfig';
import { SPRITE_MAP, UnitTypeID, getUnitSprites } from "../gameConfig";
import { TPoint } from "../../config";
import { TUnit } from "../../services/server/types";
import Game from '../Game';

const { GRID_HEIGHT, GRID_WIDTH, MOVE_INTERVAL } = GAMECONFIG

export default class Unit {
    id: number;
    typeId: UnitTypeID;
    type: string;
    coords: TPoint;
    hp: number;
    maxHp: number;
    level: number;
    sprites: number[];
    easystar: EasyStar.js;
    game: Game;
    
    isSelected: boolean = false;
    moveIntervalId: NodeJS.Timeout | null = null;
    
    constructor(data: TUnit, game: Game) {
        this.id = data.id;
        this.typeId = data.typeId as UnitTypeID;
        this.type = data.type;
        this.hp = data.currentHp;
        this.maxHp = data.currentHp; 
        this.level = data.level;

        this.sprites = getUnitSprites(this.typeId);

        this.coords = { x: data.x, y: data.y };

        this.game = game;
        this.easystar = game.getEasyStar();
    }

    updateSelection(isSelected: boolean): void {
        this.isSelected = isSelected;
    }

    private clearUnitMovement(unit: Unit): void {
        if (unit.moveIntervalId) {
            clearInterval(unit.moveIntervalId);
            unit.moveIntervalId = null;
        }
    }

    moveUnit(destination: TPoint) {
        this.clearUnitMovement(this);
        
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
                    console.warn('No path found or already at destination');
                    return;
                }

                let currentStepIndex = 1;

                this.moveIntervalId = setInterval(() => {
                    if (currentStepIndex >= path.length) {
                        this.clearUnitMovement(this);
                        return;
                    }

                    const nextStep = path[currentStepIndex];
                    
                    const isOccupied = this.game.getUnits().some(unit => 
                        unit !== this && 
                        unit.coords.x === nextStep.x && 
                        unit.coords.y === nextStep.y
                    );

                    if (isOccupied) {
                        this.clearUnitMovement(this);
                        this.moveUnit(destination);
                        return;
                    }

                    this.coords.x = nextStep.x;
                    this.coords.y = nextStep.y;

                    currentStepIndex++;
                }, MOVE_INTERVAL);
            }
        );

        this.easystar.calculate();
    }
}