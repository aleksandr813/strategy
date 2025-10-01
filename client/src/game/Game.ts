import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Build from './Builds/Build';
import EasyStar from 'easystarjs';

const { WIDTH, HEIGHT } = CONFIG;

class Game {
    private units:Unit[];
    private builds:Build[];
    private villageMatrix:number[];
    

    constructor() {
        this.units = [new Unit(0, 0)]
        this.builds = [new Build(5, 5)]
        this.villageMatrix = [];
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
            booleanMatrix[element.cords.y][element.cords.x] = 1;
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
        let easystar = new EasyStar.js();

        let unitsForMove = this.units.filter(unit => unit.isHighlighted);

        unitsForMove.forEach((unit) => {
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