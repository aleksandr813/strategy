import CONFIG, { TPoint } from "../config";
import Unit from './Units';
import Build from './Builds';
const { WIDTH, HEIGHT } = CONFIG;

class Game {
    private units:Unit[];
    private builds:Build[];
    binarMatrix:number[];
    

    constructor() {
        this.units = [new Unit(0, 0), new Unit(0, 5)]
        this.builds = [new Build(5, 5)]
        this.binarMatrix = []
        
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

    matrixForEasyStar () {
        for (let i = 0; i < 29 * 29; i++) {
            this.binarMatrix.push(0); // бинарная матрица заполняется нулями
            const x = Math.floor(i / 29);//
            const y = i % 29;//уловные х и у для бинарной матрицы
            for (let j = 0; j < this.units.length; j++) {
                if ((this.units[j].cords.x = x) && (this.units[j].cords.y = y)) { //проверка на юнитов: координаты юнита(х, у) сравниваются с условными координатами бинарной матрицы
                    this.binarMatrix[i] = 1;
                }
            }
            for (let j = 0; j < this.builds.length; j++) {
                if ((this.builds[j].cords[0].x = x) && (this.builds[j].cords[0].y = y)) { //проверка на здания. Проверяется только нижний левый угол. В оставшиесе клетки тоже передаётся 1
                    this.binarMatrix[i] = 1;
                    this.binarMatrix[i + 1] = 1;
                    this.binarMatrix[i - 29] = 1;
                    this.binarMatrix[i - 28] = 1;
                }
            }
        }
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