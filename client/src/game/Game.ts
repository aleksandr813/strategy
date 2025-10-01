import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Build from './Builds';
import EasyStar from 'easystarjs';

const { WIDTH, HEIGHT } = CONFIG;

class Game {
    private units:Unit[];
    private builds:Build[];
    private villageMatrix:number[];
    

    constructor() {
        this.units = [new Unit(0, 0), new Unit(0, 5)]
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

    moveUnits() { //Сюда передаём НЕ всех юнитов, а массив с выделенными юнитами, а также матрицу с 0, где свободно для движения и 1, где чтокто-то стоит
        let easystar = new EasyStar.js();

        let booleanMatrix = this.getVillageMatrix(this.units, this.builds)

        easystar.setGrid(booleanMatrix);
        easystar.setAcceptableTiles(0);

        easystar.findPath(this.units[0].cords.x, this.units[0].cords.y, 6, 7, ( path ) => {
            if (path === null) {
                console.log("Path was not found");
            }
            else {
                if (path[1]) {
                    //console.log(path[1]);
                    this.units[0].cords = path[1];
                }
            }
        })
        console.log(booleanMatrix);
        easystar.calculate()
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