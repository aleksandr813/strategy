import EasyStar from 'easystarjs';
import GAMECONFIG from '../gameConfig';
import { SPRITE_MAP, UnitTypeID, getUnitSprites } from "../gameConfig";
import { TPoint } from "../../config";
import { TUnit } from "../../services/server/types";
import Game from '../Game';
import Building from './Building';
export type UnitSide = 'ally' | 'enemy';

const { GRID_HEIGHT, GRID_WIDTH, MOVE_INTERVAL } = GAMECONFIG

export interface IAttackable {
    id: number;
    coords: TPoint | TPoint[];
    hp: number;
    takeDamage(amount: number): void;
}

export default class Unit {
    id: number;
    typeId: UnitTypeID;
    type: string;
    coords: TPoint;
    hp: number;
    maxHp: number;
    level: number;
    speed: number = 1;
    movementAccumulator: number = 0;
    sprites: number[];
    easystar: EasyStar.js;
    game: Game;
    unlockLevel: number;
    side: UnitSide;
    damage: number = 10;
    attackRange: number = 1;

    isSelected: boolean = false;
    moveIntervalId: NodeJS.Timeout | null = null;
    
    private currentPath: TPoint[] | null = null;
    private currentPathIndex: number = 0;
    private currentSpriteIndex: number = 0;
    private idleAnimationIntervalId: NodeJS.Timeout | null = null;
    private static readonly IDLE_ANIMATION_DELAY: number = 300;
    
    private waitCounter: number = 0;
    private static readonly MAX_WAIT_ATTEMPTS: number = 5;
    
    private currentTarget: IAttackable | null = null;
    private isAttacking: boolean = false;
    
    constructor(data: TUnit, game: Game, easystar: EasyStar.js, side: UnitSide) {
        this.id = data.id;
        this.typeId = data.typeId as UnitTypeID;
        this.type = data.type;
        this.hp = data.currentHp;
        this.maxHp = data.currentHp; 
        this.level = data.level;
        this.speed = data.speed;
        this.unlockLevel = data.unlockLevel
        this.side = side;

        this.sprites = getUnitSprites(this.typeId);
        this.startIdleAnimation();

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
        this.waitCounter = 0;
    }

    calcPath(destination: TPoint, units: Unit[], buildings: Building[]) {
        this.clearUnitMovement();
        this.movementAccumulator = 0;
        
        const matrix = this.game.getMatrixForEasyStar(units, buildings);
        this.easystar.setGrid(matrix);

        const acceptableTiles = [0];

        if (!this.isEnemy()) {
            acceptableTiles.push(2);
        }

        this.easystar.setAcceptableTiles(acceptableTiles);


        this.easystar.findPath(
            this.coords.x, 
            this.coords.y, 
            destination.x, 
            destination.y, 
            (path) => {
                if (path === null) {
                    return;
                }
                
                if (path.length <= 1) {
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

        const isOccupiedByBuilding = this.game.village.isTileOccupiedByBuilding(nextStep.x, nextStep.y);
        
        if (isOccupiedByBuilding) {
            this.clearUnitMovement();
            return false; 
        }
        
        const isOccupiedByUnit = this.game.getUnits().some(unit => 
            unit !== this && 
            unit.coords.x === nextStep.x && 
            unit.coords.y === nextStep.y
        );

        if (isOccupiedByUnit) {
            this.waitCounter++;
            
            if (this.waitCounter >= Unit.MAX_WAIT_ATTEMPTS) {
                this.clearUnitMovement();
                return false;
            }
            
            return true;
        }

        this.waitCounter = 0; 
        this.coords.x = nextStep.x;
        this.coords.y = nextStep.y;
        this.currentPathIndex++;

        const stillMoving = this.currentPathIndex < this.currentPath.length;

        return stillMoving;
    }

    isMoving(): boolean {
        return this.currentPath !== null && this.currentPathIndex < this.currentPath.length;
    }

    isMyUnit() {
        return this.side === 'ally';
    }

    isEnemy() {
        return this.side === 'enemy';
    }

    public getCurrentSpriteId(): number {
        return this.sprites[this.currentSpriteIndex];
    }

    private switchSprite(): void {
        if (this.sprites.length > 1) {
            this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.sprites.length;
        } else {
            this.currentSpriteIndex = 0;
        }
    }

    public startIdleAnimation(): void {
        if (this.idleAnimationIntervalId !== null) return; 

        this.idleAnimationIntervalId = setInterval(() => {
            this.switchSprite(); 
        }, Unit.IDLE_ANIMATION_DELAY); 
    }
    
    public recalculatePathToDestination(units: Unit[], buildings: Building[]): void {
        if (!this.currentPath || this.currentPath.length === 0) {
            return;
        }
        
        const destination = this.currentPath[this.currentPath.length - 1];
        this.calcPath(destination, units, buildings);
    }

    public setTarget(target: IAttackable): void {
        this.currentTarget = target;
        this.isAttacking = true;
    }

    public clearTarget(): void {
        this.currentTarget = null;
        this.isAttacking = false;
    }

    public getTarget(): IAttackable | null {
        return this.currentTarget;
    }

    public hasTarget(): boolean {
        return this.currentTarget !== null;
    }

    public isInAttackRange(target: IAttackable): boolean {
        if (Array.isArray(target.coords)) {
            return target.coords.some(targetCoord => {
                const dx = Math.abs(this.coords.x - targetCoord.x);
                const dy = Math.abs(this.coords.y - targetCoord.y);
                return dx <= this.attackRange && dy <= this.attackRange;
            });
        }
        
        const dx = Math.abs(this.coords.x - target.coords.x);
        const dy = Math.abs(this.coords.y - target.coords.y);
        
        return dx <= this.attackRange && dy <= this.attackRange;
    }

    public attack(target: IAttackable): void {
        if (!this.isInAttackRange(target)) {
            console.log(`Юнит ${this.id} не может атаковать цель - слишком далеко`);
            return;
        }

        target.takeDamage(this.damage);
        console.log(`Юнит ${this.id} атакует цель ${target.id}, нанося ${this.damage} урона. Осталось HP: ${target.hp}`);

        if (target.hp <= 0) {
            console.log(`Цель ${target.id} уничтожена!`);
            this.clearTarget();
        }
    }

    public takeDamage(amount: number): void {
        this.hp -= amount;
        if (this.hp < 0) {
            this.hp = 0;
        }
    }

    public getAttackPosition(target: IAttackable): TPoint {
        const targetCoords = Array.isArray(target.coords) ? target.coords[0] : target.coords;
        
        const targetCells: TPoint[] = [];
        if (Array.isArray(target.coords) && target.coords.length > 1) {
            targetCells.push(...target.coords);
        } else {
            targetCells.push(targetCoords);
        }
        
        const possiblePositions: TPoint[] = [];
        
        targetCells.forEach(cell => {
            for (let dx = -this.attackRange; dx <= this.attackRange; dx++) {
                for (let dy = -this.attackRange; dy <= this.attackRange; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    
                    const x = cell.x + dx;
                    const y = cell.y + dy;
                    
                    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                        const isTargetCell = targetCells.some(tc => tc.x === x && tc.y === y);
                        if (!isTargetCell) {
                            possiblePositions.push({ x, y });
                        }
                    }
                }
            }
        });
        
        const uniquePositions = possiblePositions.filter((pos, index, self) =>
            index === self.findIndex(p => p.x === pos.x && p.y === pos.y)
        );
        
        if (uniquePositions.length === 0) {
            console.warn(`Юнит ${this.id}: не найдено позиций для атаки цели`);
            return targetCoords;
        }
        
        let closestPos = uniquePositions[0];
        let minDist = Math.hypot(closestPos.x - this.coords.x, closestPos.y - this.coords.y);
        
        for (const pos of uniquePositions) {
            const dist = Math.hypot(pos.x - this.coords.x, pos.y - this.coords.y);
            if (dist < minDist) {
                minDist = dist;
                closestPos = pos;
            }
        }
        
        console.log(`Юнит ${this.id}: целевая позиция для атаки (${closestPos.x}, ${closestPos.y}), расстояние: ${minDist.toFixed(2)}`);
        return closestPos;
    }
}