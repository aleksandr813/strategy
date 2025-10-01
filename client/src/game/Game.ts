import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Build from './Builds/Build';
import EasyStar from 'easystarjs';
import Allocation from "../pages/Game/UI/Allocation";

const { WIDTH, HEIGHT } = CONFIG;

class Game {
    private units:Unit[];
    private builds:Build[];
    private allocation:Allocation;
    

    constructor() {
        this.units = [new Unit(5, 7), new Unit(0, 0)]
        this.builds = [new Build(5, 5)]
        this.allocation = new Allocation;
    }
    

    destructor() {
        //...
    }

    getScene() {
        return {
            units: this.units,
            builds: this.builds,
        };
    }

    getVillageMatrix(units:Unit[], builds:Build[]):number[][] {
        let booleanMatrix:number[][] = new Array(29);
        for (let i = 0; i < 29; i++) {
            booleanMatrix[i] = new Array(29).fill(0);
        }
        units.forEach((element) => {
            booleanMatrix[element.cords.x][element.cords.y] = 1;
        })
        builds.forEach((element) => {
            booleanMatrix[element.cords[0].x][element.cords[0].y] = 1;
            booleanMatrix[element.cords[0].x + 1][element.cords[0].y] = 1;
            booleanMatrix[element.cords[0].x][element.cords[0].y + 1] = 1;
            booleanMatrix[element.cords[0].x + 1][element.cords[0].y + 1] = 1;
        })
        return booleanMatrix;
    }

    moveUnits(destination: TPoint) {
        destination.x = Math.round(destination.x);
        destination.y = Math.round(destination.y);
        
        let easystar = new EasyStar.js();

        this.units.forEach((unit) => {
            if (!unit.isSelected) {
                return;
            }

            // Создаем копию матрицы без текущего юнита
            let booleanMatrix = this.getVillageMatrix(
                this.units.filter(u => u !== unit), 
                this.builds
            );

            easystar.setGrid(booleanMatrix);
            easystar.setAcceptableTiles([0]);

            easystar.findPath(unit.cords.x, unit.cords.y, destination.x, destination.y, (path) => {
                if (path === null) {
                    console.log("Path was not found");
                } else {
                    path.shift();

                    let stepIndex = 0;
                    let intervalId = setInterval(() => {
                        if (stepIndex < path.length) {
                            // Перед каждым шагом проверяем, не занята ли клетка
                            const nextStep = path[stepIndex];
                            const currentMatrix = this.getVillageMatrix(
                                this.units.filter(u => u !== unit), 
                                this.builds
                            );
                            
                            if (currentMatrix[nextStep.x][nextStep.y] === 0) {
                                unit.cords = nextStep;
                                stepIndex++;
                            }
                            // Если клетка занята, ждем следующего интервала
                        } else {
                            clearInterval(intervalId);
                        }
                    }, 100);
                }
            });
        });

    easystar.calculate();
}

    

    /**
    move(dx: number, dy: number): void {
        if ((dx > 0 && this.kapitoshka.x + dx <= WIDTH - 1) ||
            (dx < 0 && this.kapitoshka.x - dx >= 0)
        ) {
            this.kapitoshka.x += dx;
        }
        if ((dy > 0 && this.kapitoshka.y + dy <= HEIGHT - 1) ||
            (dy < 0 && this.kapitoshka.y - dy >= 0)
        ) {
            this.kapitoshka.y += dy;
        }
    }  */
}

export default Game;