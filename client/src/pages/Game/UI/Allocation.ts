import CONFIG from '../../../config';
import { TPoint } from '../../../config';
import Unit from '../../../game/Units/Unit';

const { SPRITE_SIZE } = CONFIG;

export default class Allocation {
    private _start: TPoint | null = null;
    private _end: TPoint | null = null;
    isSelectingStatus = false;

    start(x: number, y: number): void {
        this._start = { x, y };
        this._end = { x, y };
        this.isSelectingStatus = true;
        console.log(this._start)
    }

    update(x: number, y: number): void {
        if (this._start) {
            this._end = { x, y };
        }
    }

    end(units: Unit[]) {

        this.isSelectingStatus = false;

        const rect = this.getSelectionRect();
        if (!rect) {
            units.forEach(u => u.updateSelection(false)); 
            this._start = null;
            this._end = null;
            return;
        }
        console.log('rect', rect)
        console.log(units.map(u=>u.cords))

        const unitW = 1;
        const unitH = 1;

        units.forEach((unit) => {
            const ux = unit.cords.x;
            const uy = unit.cords.y;

            const intersects = !(
                ux + unitW <= rect.x ||        
                ux >= rect.x + rect.width ||   
                uy + unitH <= rect.y ||        
                uy >= rect.y + rect.height     
            );

            unit.updateSelection(intersects);
        });

        this._start = null;
        this._end = null;
    }


    isUnitInSelection(unit: Unit) {
    const rect = this.getSelectionRect();
    if (!rect) return false;

    // координаты рамки rect  уже в тайлах/локальных единицах
    const rectX = rect.x;
    const rectY = rect.y;
    const rectW = rect.width;
    const rectH = rect.height;

    // координаты юнита  уже в тайлах
    const unitLocalX = unit.cords.x;
    const unitLocalY = unit.cords.y;
    const unitW = 1; // 1x1 тайл
    const unitH = 1; // 1x1 тайл

    // проверка пересечения в тайловой системе
    return !(
        unitLocalX + unitW <= rectX ||      // юнит полностью слева от рамки
        unitLocalX >= rectX + rectW ||      // юнит полностью справа от рамки
        unitLocalY + unitH <= rectY ||      // юнит полностью выше рамки
        unitLocalY >= rectY + rectH         // юнит полностью ниже рамки
    );
}

    getSelectionRect() {
        if (!this._start || !this._end) return null;

        const x = Math.min(this._start.x, this._end.x);
        const y = Math.min(this._start.y, this._end.y);
        const width = Math.abs(this._end.x - this._start.x);
        const height = Math.abs(this._end.y - this._start.y);

        if (width === 0 || height === 0) return null;

        return { x, y, width, height };
    }
}
