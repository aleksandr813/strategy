import CONFIG from '../../../config';
import { TPoint } from '../../../config';
import Unit from '../../../game/Units/Unit';


export default class Allocation {
    private _start: TPoint | null = null;
    private _end: TPoint | null = null;
    isSelectingStatus = false;

    start(x: number, y: number): void {
        this._start = { x, y };
        this._end = { x, y };
        this.isSelectingStatus = true;
        console.log('start selection at', this._start);
    }

    update(x: number, y: number): void {
        if (this._start) {
            this._end = { x, y };
        }
    }

    end(units: Unit[]): void {
        this.isSelectingStatus = false;

        const rect = this.getSelectionRect();
        if (!rect) {
            units.forEach(u => u.updateSelection(false));
            this._start = null;
            this._end = null;
            return;
        }
        console.log('selection rect', rect);
        console.log('units positions', units.map(u => u.cords));

        const unitW = 1;
        const unitH = 1;

        units.forEach((unit) => {
            const ux = unit.cords[0].x;
            const uy = unit.cords[0].y;

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

    cancel(): void {
        this.isSelectingStatus = false;
        this._start = null;
        this._end = null;
    }

    clearSelection(units: Unit[]): void {
        this.isSelectingStatus = false;
        this._start = null;
        this._end = null;
        units.forEach(u => u.updateSelection(false));
    }

    isUnitInSelection(unit: Unit): boolean {
        const rect = this.getSelectionRect();
        if (!rect) return false;

        const rectX = rect.x;
        const rectY = rect.y;
        const rectW = rect.width;
        const rectH = rect.height;

        const unitLocalX = unit.cords[0].x;
        const unitLocalY = unit.cords[0].y;
        const unitW = 1;
        const unitH = 1;

        return !(
            unitLocalX + unitW <= rectX ||
            unitLocalX >= rectX + rectW ||
            unitLocalY + unitH <= rectY ||
            unitLocalY >= rectY + rectH
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