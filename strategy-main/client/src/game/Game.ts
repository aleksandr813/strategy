import CONFIG, { TPoint } from "../config";
import Unit from './Units';
import Build from './Builds';
import Allocation from "../pages/Game/UI/Allocation";
const { WIDTH, HEIGHT } = CONFIG;

class Game {
    private units:Unit[];
    private builds:Build[];
    private allocation:Allocation

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