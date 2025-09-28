import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Build from './Builds';
const { WIDTH, HEIGHT } = CONFIG;

class Game {
    private units:Unit[];
    private builds:Build[];
    binaryMatrix:number[];
    private villageMatrix:boolean[];
    

    constructor() {
        this.units = [new Unit(0, 0), new Unit(0, 5)]
        this.builds = [new Build(5, 5)]
        this.binaryMatrix = []
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

    getVillageMatrix(units:Unit[], builds:Build[]):boolean[][] {
        let booleanMatrix:boolean[][] = new Array(29);
        for (let i = 0; i < 29; i++) {
            booleanMatrix[i] = new Array(29).fill(0);
        }
        return booleanMatrix;
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