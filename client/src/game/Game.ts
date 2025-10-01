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
        this.units = [new Unit(10, 10), new Unit(11, 6)]
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
                return
            }

            let booleanMatrix = this.getVillageMatrix(this.units, this.builds)

            easystar.setGrid(booleanMatrix);
            easystar.setAcceptableTiles([0]); // проходимые клетки

            easystar.findPath(unit.cords.x, unit.cords.y, destination.x, destination.y, (path) => {
                if (path === null) {
                    console.log("Path was not found");
                } else {
                    // убираем стартовую точку (она = позиция юнита)
                    path.shift();

                    // запускаем пошаговое движение
                    let stepIndex = 0;

                    let intervalId = setInterval(() => {
                        if (stepIndex < path.length) {
                            unit.cords = path[stepIndex];
                            stepIndex++;
                            //booleanMatrix = this.getVillageMatrix(this.units, this.builds);
                        } else {
                            clearInterval(intervalId); // закончили движение
                        }
                    }, 100); // шаг раз в 0.1 сек
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