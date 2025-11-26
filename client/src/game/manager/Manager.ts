import EasyStar from 'easystarjs';
import { TPoint } from '../../config';
import CONFIG from '../../config';
import Allocation from "../../services/canvas/Allocation";
import Server from '../../services/server/Server';
import GAMECONFIG from '../gameConfig';
import Unit from '../entities/Unit';
import Building from '../entities/Building';

const { WIDTH, HEIGHT } = CONFIG;
const { GRID_HEIGHT, GRID_WIDTH, MOVE_INTERVAL } = GAMECONFIG

export interface GameData {
    getUnits: () => Unit[];
    getBuildings: () => Building[];
    setUnits: (units: Unit[]) => void;
    setBuildings: (buildings: Building[]) => void;
    addUnit: (unit: Unit) => void;
    addBuilding: (building: Building) => void;
    removeUnit: (unit: Unit) => void;
    removeBuilding: (building: Building) => void;
}

class Manager {
    protected gameData: GameData;
    protected allocation: Allocation;
    private movementIntervalId: NodeJS.Timeout | null = null;
    private currentServer: Server | null = null;
    
    constructor(gameData: GameData) {
        this.gameData = gameData;
        this.allocation = new Allocation();
    }

    destructor() {
        if (this.movementIntervalId) {
            clearInterval(this.movementIntervalId);
            this.movementIntervalId = null;
        }
    }

    getScene() {
        return {
            units: this.gameData.getUnits(),
            buildings: this.gameData.getBuildings(),
        };
    }

    getMatrixForEasyStar(excludedUnit?: Unit): number[][] {
        const matrix: number[][] = Array.from(
            { length: GRID_HEIGHT }, 
            () => Array(GRID_WIDTH).fill(0)
        );

        this.gameData.getUnits().forEach((unit) => {
            if (unit !== excludedUnit && unit.coords.y < GRID_HEIGHT && unit.coords.x < GRID_WIDTH) {
                matrix[unit.coords.y][unit.coords.x] = 1;
            }
        });

        this.gameData.getBuildings().forEach((building) => {
            const { x, y } = building.coords[0];
            for (let dy = 0; dy <= 1; dy++) {
                for (let dx = 0; dx <= 1; dx++) {
                    if (y + dy < GRID_HEIGHT && x + dx < GRID_WIDTH) {
                        matrix[y + dy][x + dx] = 1;
                    }
                }
            }
        });

        return matrix;
    }

    private isValidDestination(destination: TPoint): boolean {
        return destination.x >= 0 && 
               destination.x < GRID_WIDTH && 
               destination.y >= 0 && 
               destination.y < GRID_HEIGHT;
    }

    moveUnits(destination: TPoint, server: Server) {
        destination.x = Math.round(destination.x);
        destination.y = Math.round(destination.y);

        if (!this.isValidDestination(destination)) {
            return;
        }

        this.currentServer = server;

        if (this.movementIntervalId) {
            clearInterval(this.movementIntervalId);
            this.movementIntervalId = null;
        }

        const selectedUnits: Unit[] = [];
        this.gameData.getUnits().forEach((unit) => {
            if (unit.isSelected) {
                unit.moveUnit(destination);
                selectedUnits.push(unit);
            }
        });

        if (selectedUnits.length > 0) {
            this.startMovementCycle();
        }
    }

    private startMovementCycle() {
        this.movementIntervalId = setInterval(() => {
            const movingUnits: Unit[] = [];
            let anyUnitMoving = false;

            this.gameData.getUnits().forEach((unit) => {
                if (unit.isMoving()) {
                    const stillMoving = unit.makeStep();
                    anyUnitMoving = true;
                    movingUnits.push(unit);
                }
            });

            if (movingUnits.length > 0 && this.currentServer) {
                this.currentServer.moveUnits(movingUnits);
            }

            if (!anyUnitMoving && this.movementIntervalId) {
                clearInterval(this.movementIntervalId);
                this.movementIntervalId = null;
                this.currentServer = null;
            }
        }, MOVE_INTERVAL);
    }
}

export default Manager;