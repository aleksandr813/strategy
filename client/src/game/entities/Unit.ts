import EasyStar from 'easystarjs';
import GAMECONFIG from '../gameConfig';
import { SPRITE_MAP, UnitTypeID, getUnitSprites } from "../gameConfig";
import { TPoint } from "../../config";
import { TUnit } from "../../services/server/types";
import Game from '../Game';
import { useContext } from 'react';

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
    easyStar: EasyStar.js;
    
    isSelected: boolean = false;
    moveIntervalId: NodeJS.Timeout | null = null;
    
    constructor(data: TUnit, easyStar: EasyStar.js) {
        this.id = data.id;
        this.typeId = data.typeId as UnitTypeID;
        this.type = data.type;
        this.hp = data.currentHp;
        this.maxHp = data.currentHp; 
        this.level = data.level;

        this.sprites = getUnitSprites(this.typeId);

        this.coords = { x: data.x, y: data.y };
        this.easyStar = easyStar;
    }

    updateSelection(isSelected: boolean): void {
        this.isSelected = isSelected;
    }

    private isValidDestination(destination: TPoint): boolean {
        return destination.x >= 0 && 
               destination.x < GRID_WIDTH && 
               destination.y >= 0 && 
               destination.y < GRID_HEIGHT;
    }

    private clearUnitMovement(unit: Unit): void {
        if (unit.moveIntervalId) {
            clearInterval(unit.moveIntervalId);
            unit.moveIntervalId = null;
        }
    }

    moveUnit(destination: TPoint) {
        if (!this.isValidDestination(destination)) {
            console.warn('Invalid destination:', destination);
            return;
        }

        this.clearUnitMovement(this);

        this.easyStar.findPath(
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
                    this.coords.x = nextStep.x;
                    this.coords.y = nextStep.y;

                    currentStepIndex++;
                }, MOVE_INTERVAL);
            }
        );

        this.easyStar.calculate();
    }
}