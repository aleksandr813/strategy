import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Building from './Buildings/Building';
import EasyStar from 'easystarjs';
import Allocation from "../pages/Village/UI/Allocation";
import Store from "../services/store/Store";

const { WIDTH, HEIGHT } = CONFIG;
const GRID_WIDTH = 87;
const GRID_HEIGHT = 29;
const MOVE_INTERVAL = 100;

class Game {
    protected units: Unit[];
    protected buildings: Building[] = [];
    protected allocation: Allocation;
    protected easystar = new EasyStar.js();

    constructor() {
        this.units = [];
        this.buildings = [];
        this.allocation = new Allocation();
    }

    destructor() {}

    getScene() {
        return {
            units: this.units,
            buildings: this.buildings,
        };
    }

    getMatrixForEasyStar(excludedUnit?: Unit): number[][] {
        const matrix: number[][] = Array.from(
            { length: GRID_HEIGHT }, 
            () => Array(GRID_WIDTH).fill(0)
        );

        this.units.forEach((unit) => {
            if (unit !== excludedUnit && unit.cords.y < GRID_HEIGHT && unit.cords.x < GRID_WIDTH) {
                matrix[unit.cords.y][unit.cords.x] = 1;
            }
        });

        this.buildings.forEach((building) => {
            const { x, y } = building.cords[0];
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

    private clearUnitMovement(unit: Unit): void {
        if (unit.moveIntervalId) {
            clearInterval(unit.moveIntervalId);
            unit.moveIntervalId = null;
        }
    }

    private reserveCell(x: number, y: number, unit: Unit, reservations: Map<string, Unit>): boolean {
        const key = `${x},${y}`;
        if (!reservations.has(key)) {
            reservations.set(key, unit);
            return true;
        }
        return false;
    }

    moveUnits(destination: TPoint) {
        destination.x = Math.round(destination.x);
        destination.y = Math.round(destination.y);

        if (!this.isValidDestination(destination)) {
            return;
        }

        const cellReservations = new Map<string, Unit>();

        this.units.forEach((unit) => {
            if (!unit.isSelected) return;

            this.clearUnitMovement(unit);

            const matrix = this.getMatrixForEasyStar(unit);
            
            this.easystar.setGrid(matrix);
            this.easystar.setAcceptableTiles([0]);

            this.easystar.findPath(
                unit.cords.x, 
                unit.cords.y, 
                destination.x, 
                destination.y, 
                (path) => {
                    if (!path) {
                        console.log("Path was not found");
                        return;
                    }

                    path.shift();
                    let stepIndex = 0;

                    unit.moveIntervalId = setInterval(() => {
                        if (stepIndex >= path.length) {
                            this.clearUnitMovement(unit);
                            return;
                        }

                        const nextStep = path[stepIndex];
                        const currentMatrix = this.getMatrixForEasyStar(unit);

                        if (currentMatrix[nextStep.y][nextStep.x] === 0) {
                            const key = `${nextStep.x},${nextStep.y}`;
                            const reservingUnit = cellReservations.get(key);
                            
                            const oldKey = `${unit.cords.x},${unit.cords.y}`;
                            if (cellReservations.get(oldKey) === unit) {
                                cellReservations.delete(oldKey);
                            }

                            if (!reservingUnit || reservingUnit === unit) {
                                cellReservations.set(key, unit);
                                unit.cords = nextStep;
                                stepIndex++;
                            }
                        }
                    }, MOVE_INTERVAL);
                }
            );
        });

        this.easystar.calculate();
    }
}

export default Game;