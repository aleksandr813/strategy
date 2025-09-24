import Unit from "../Units";
import Game from "../Game";

export class Allocation {
    private game: Game;
    constructor(game: Game){
        this.game= game;
    }

    selection(startX: number, startY: number, endX: number, endY: number){
        const units = this.game.getUnits();

        units.forEach(unit => {
        unit.isHightlited = false;
    });


    const minX = Math.min(startX, endX);

    const maxX = Math.max(startX, endX);

    const minY = Math.min(startY, endY);

    const maxY = Math.max(startY, endY);

    units.forEach(unit => {
        if(
            unit.cords.x >= minX&&
            unit.cords.x <= maxX&&
            unit.cords.y >= minY&&
            unit.cords.y <= maxY
        ){
            unit.isHightlited = true;
        }
    });

    }
    

}
