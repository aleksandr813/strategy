import EasyStar from 'easystarjs';
import { TPoint } from '../../config';
import CONFIG from '../../config';
import Allocation from "../../services/canvas/Allocation";
import Server from '../../services/server/Server';
import GAMECONFIG from '../gameConfig';
import Unit from '../entities/Unit';
import Building from '../entities/Building';
import Game from '../Game';

const { WIDTH, HEIGHT } = CONFIG;
const { GRID_HEIGHT, GRID_WIDTH, MOVE_INTERVAL } = GAMECONFIG;

class Manager {
    protected game: Game;
    protected allocation: Allocation;
    private movementIntervalId: NodeJS.Timeout | null = null;
    private currentServer: Server | null = null;
    private anyStuckUnit: boolean;

    constructor(game: Game) {
        this.game = game;
        this.allocation = new Allocation();
        this.anyStuckUnit = false;
    }

    destructor() {
        if (this.movementIntervalId) {
            clearInterval(this.movementIntervalId);
            this.movementIntervalId = null;
        }
    }

    getScene() {
        return {
            units: this.game.getUnits(),
            buildings: this.game.getBuildings(),
        };
    }


    private isValidDestination(destination: TPoint): boolean {
        return destination.x >= 0 &&
            destination.x < GRID_WIDTH &&
            destination.y >= 0 &&
            destination.y < GRID_HEIGHT;
    }

    moveUnits(destination: TPoint, units: Unit[], buildings: Building[], server: Server) {
        for (let i = 0; i < 10; i++) {
            this.anyStuckUnit = false;

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

            this.game.getUnits().forEach((unit) => {
                if (unit.isSelected && unit.isMyUnit()) {
                    unit.calcPath(destination, units, buildings);
                    selectedUnits.push(unit);
                    if (unit.labelPathIsNotBuilt) {
                        this.anyStuckUnit = true
                    }
                }
            });

            if (selectedUnits.length > 0) {
                this.startMovementCycle();
            }

            if (!this.anyStuckUnit) {
                break;
            }
        }
    }

    private startMovementCycle() {
        this.movementIntervalId = setInterval(() => {
            const movingUnits: Unit[] = [];
            let anyUnitMoving = false;

            this.game.getUnits().forEach((unit) => {
                if (unit.isMoving()) {
                    anyUnitMoving = true;

                    unit.movementAccumulator += unit.speed;

                    if (unit.movementAccumulator >= 1) {
                        unit.movementAccumulator -= 1;
                        const stillMoving = unit.makeStep();
                        if (stillMoving) {
                            movingUnits.push(unit);
                        }
                    }
                }
            });

            if (movingUnits.length > 0 && this.currentServer) {
                this.currentServer.moveUnits(movingUnits);
            }


            if ((!anyUnitMoving || this.anyStuckUnit) && this.movementIntervalId) {
                clearInterval(this.movementIntervalId);
                this.movementIntervalId = null;
                this.currentServer = null;
            }
        }, MOVE_INTERVAL);
    }
}

export default Manager;