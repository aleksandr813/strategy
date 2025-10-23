import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Building from './Buildings/Building';
import EasyStar from 'easystarjs';
import Allocation from "../pages/Village/UI/Allocation";
import Store from "../services/store/Store";

const { WIDTH, HEIGHT } = CONFIG;

class Game {
    protected units:Unit[];
    protected buildings:Building[] = [];
    protected allocation:Allocation;
    protected easystar = new EasyStar.js();
    

    constructor() {
        this.units = []
        this.buildings = []
        this.allocation = new Allocation;
    }
    

    destructor() {

    }

    getScene() {
        return {
            units: this.units,
            buildings: this.buildings,
        };
    }

    getMatrixForEasyStar(units:Unit[], buildings:Building[]):number[][] {
        let booleanMatrix:number[][] = Array(29).fill(null).map(() => Array(87).fill(0));
        for (let i = 0; i < 29; i++) {
            booleanMatrix[i] = new Array(87).fill(0);
        }
        units.forEach((element) => {
            booleanMatrix[element.cords.x][element.cords.y] = 1;
        })
        buildings.forEach((element) => {
            booleanMatrix[element.cords[0].y][element.cords[0].x] = 1;
            booleanMatrix[element.cords[0].y + 1][element.cords[0].x] = 1;
            booleanMatrix[element.cords[0].y][element.cords[0].x + 1] = 1;
            booleanMatrix[element.cords[0].y + 1][element.cords[0].x + 1] = 1;
        })
        return booleanMatrix;
    }

    moveUnits(destination: TPoint) {
        destination.x = Math.round(destination.x);
        destination.y = Math.round(destination.y);
        
        this.units.forEach((unit) => {
            if (!unit.isSelected) {
                return;
            }

            if (unit.moveIntervalId) {
                clearInterval(unit.moveIntervalId);
                unit.moveIntervalId = null;
            }

            let booleanMatrix = this.getMatrixForEasyStar(
                this.units.filter(u => u !== unit), 
                this.buildings
            );

            if (destination.x+1 > booleanMatrix[0].length || destination.y+1 > booleanMatrix.length || destination.x < 0 || destination.y < 0) {
                return
            }

            this.easystar.setGrid(booleanMatrix);
            this.easystar.setAcceptableTiles(0);

            this.easystar.findPath(unit.cords.x, unit.cords.y, destination.x, destination.y, (path) => {
                if (path === null) {
                    console.log("Path was not found");
                } else {
                    path.shift();

                    let stepIndex = 0;
                    unit.moveIntervalId = setInterval(() => {
                        if (stepIndex < path.length) {
                            const nextStep = path[stepIndex];
                            const currentMatrix = this.getMatrixForEasyStar(
                                this.units.filter(u => u !== unit), 
                                this.buildings
                            );
                            
                            if (currentMatrix[nextStep.y][nextStep.x] === 0) {
                                unit.cords = nextStep;
                                stepIndex++;
                            }
                        } else {
                            if (unit.moveIntervalId) {
                                clearInterval(unit.moveIntervalId);
                                unit.moveIntervalId = null;
                            }
                        }
                    }, 100);
                }
            });
        });

        this.easystar.calculate();
    }

}

export default Game;