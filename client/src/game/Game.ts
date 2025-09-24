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
            if ((this.units[i].cords.x = x) && (this.units[i].cords.y = y)) { //проверка на юнитов: координаты юнита(х, у) сравниваются с условными координатами бинарной матрицы
                this.binarMatrix[i] = 1;
            }
            for (let j = 0; j < 3; j ++) {
                if ((this.builds[i].cords[j].x = x) && (this.builds[i].cords[j].y = y)) { //проверка на здания
                    this.binarMatrix[i] = 1;
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