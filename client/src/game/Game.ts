import CONFIG, { TPoint } from "../config";
import Unit from './Units';
const { WIDTH, HEIGHT } = CONFIG;

class Game {
    private units:Unit[];

    constructor() {
        this.units = [new Unit(0, 0), new Unit(5, 5)]
    }

    destructor() {
        //...
    }

    getScene() {
        return {
            units: this.units,
        };
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