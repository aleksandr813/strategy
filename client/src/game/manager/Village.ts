import EasyStar from 'easystarjs';
import CONFIG, { TPoint } from "../../config";
import BuildingPreview from "../../services/canvas/BuildingPreview";
import UnitPreview from "../../services/canvas/UnitPreview";
import Server from "../../services/server/Server";
import Store from "../../services/store/Store";
import Unit from '../entities/Unit';
import Building from '../entities/Building';
import Mediator from '../../services/mediator/Mediator';
import Game from '../Game';
import Manager from "./Manager";
import { BuildingTypeID } from '../../services/server/types';

const { WIDTH, HEIGHT } = CONFIG;

class Village extends Manager {
    private buildingPreview: BuildingPreview;
    private unitPreview: UnitPreview;
    private store: Store;
    private mediator: Mediator;
    private server: Server;
    public selectedBuilding: Building | null = null;
    public selectedUnit: Unit | null = null;
    public easyStar: EasyStar.js;

    constructor(store: Store, server: Server, mediator: Mediator, easyStar: EasyStar.js, game: Game) {
        super(game);
        this.store = store;
        this.server = server;
        this.mediator = mediator;
        this.easyStar = easyStar;
        this.buildingPreview = new BuildingPreview(game);
        this.unitPreview = new UnitPreview(game);
    }

    public selectBuilding(building: Building | null): void {
        this.game.getBuildings().forEach(b => b.deselected?.());
        if (building) building.selected?.();
        this.selectedBuilding = building;
        this.mediator.call('BUILDING_SELECTED', building);
    }

    public getBarracksLevel(): number {
        const buildings = this.game.getBuildings();
        const barracks = buildings.find(
            (b) => b.typeId === BuildingTypeID.Kazarma
        );
        return barracks ? barracks.level : 0;
    }

    public getTownHallLevel(): number {
        const buildings = this.game.getBuildings();
        const townHall = buildings.find(
            (b) => b.typeId === BuildingTypeID.TownHall
        );
        return townHall ? townHall.level : 0;
    }
    
    public selectUnit(unit: Unit | null): void {
        this.game.getUnits().forEach(u => u.updateSelection(false));
        if (unit) {
            unit.updateSelection(true);
        }
        this.selectedUnit = unit;
    }

    public getSelectedUnits(): Unit[] {
        return this.game.getUnits().filter(u => u.isSelected);
    }

    public async sendArmy(target: number, unitIds: number[]): Promise<boolean> {
        if (unitIds.length === 0) {
            console.error('Нет юнитов для отправки');
            return false;
        }

        console.log('Отправка армии:', { target, unitIds });
        
        const result = await this.server.sendArmy(target, unitIds);
        
        if (result) {
            console.log('Армия успешно отправлена');
            await this.loadUnits();
            return true;
        } else {
            console.error('Ошибка отправки армии');
            return false;
        }
    }

    public async removeBuilding(building: Building): Promise<void> {
        await this.game.removeBuilding(building);
        if (this.selectedBuilding === building) {
            this.selectedBuilding = null;
        }
        this.updateAllWallSprites();
        await this.loadBuildings();
    }

    public async handleBuildingPlacement(): Promise<void> {
        if (!this.buildingPreview.tryPlace()) return;

        const typeId = this.buildingPreview.getBuildingTypeId();
        const position = this.buildingPreview.getPlacementPosition();
        
        const result = await this.server.buyBuilding(typeId, position.x, position.y);
        
        if (result) {
            await this.loadBuildings();
            if (typeId === 4) {
                this.updateAllWallSprites();
            }
            if (typeId === 6){
                this.updateAllGateSprites();
            }
            this.server.getIncome();
        }
    }

    public async handleUnitPlacement(): Promise<void> {
        if (!this.unitPreview.tryPlace()) return;

        const typeId = this.unitPreview.getUnitTypeId();
        const position = this.unitPreview.getPlacementPosition();

        const result = await this.server.buyUnit(typeId, position.x, position.y);

        if (result) {
            await this.loadUnits();
            this.server.getIncome();
        }
    }

    public handleBuildingClick(x: number, y: number): void {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        const clickedBuilding = this.game.getBuildings().find(b => {
            const [bx, by] = [b.coords[0].x, b.coords[0].y];
            return gridX >= bx && gridX < bx + 2 && gridY >= by && gridY < by + 2; 
        }) || null;

        if (clickedBuilding) {
            console.log("Выбранное здание", clickedBuilding);
            //clickedBuilding.takeDamage(10);
        }
        
        this.selectBuilding(clickedBuilding);
    }

    public handleUnitClick(x: number, y: number): Unit | null {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        const clickedUnit = this.game.getUnits().find(u => {
            const [ux, uy] = [u.coords.x, u.coords.y];
            return gridX >= ux && gridX < ux + 1 && gridY >= uy && gridY < uy + 1; 
        }) || null;

        if (clickedUnit) {
            console.log("Выбранный юнит", clickedUnit);
            this.selectUnit(clickedUnit);
        }

        return clickedUnit;
    }

    async loadBuildings(): Promise<void> {
        console.log("Загружаем здания из сервера...");

        const buildingsData = await this.server.getBuildings();
        if (!buildingsData) {
            console.log('Нету зданий для загрузки');
            return;
        }

        const buildings = buildingsData.map(buildingData => {
            let size = 2;
            if (buildingData.typeId === 4) {
                size = 1;
            };

            return new Building(
                buildingData.id,
                buildingData.type,
                buildingData.currentHp, 
                buildingData.currentHp,
                buildingData.level,
                size,
                buildingData.typeId,
                buildingData.x,
                buildingData.y,
                buildingData.unlockLevel   
            );
        });

        this.game.setBuildings(buildings);
        this.updateAllWallSprites();
        this.updateAllGateSprites();
        console.log("Загружено зданий:", this.game.getBuildings().length);
    }

    async loadUnits(): Promise<void> {
        console.log("Загружаем юнитов из сервера...");
        
        const unitsData = await this.server.getUnits();
        if (!unitsData) {
            console.log('Нету юнитов для загрузки');
            return;
        }

        const units = unitsData.map(unitData => new Unit(unitData, this.game, this.easyStar));
        
        this.game.setUnits(units);
        console.log("Загружено юнитов:", this.game.getUnits().length);
    }

    getScene() {
        return {
            units: this.game.getUnits(),
            buildings: this.game.getBuildings(),
            buildingPreview: this.buildingPreview,
            unitPreview: this.unitPreview,
        };
    }

    getVillageMatrix(units: Unit[], buildings: Building[]): number[][] {
        const booleanMatrix: number[][] = Array(29).fill(null).map(() => Array(87).fill(0));
        
        units.forEach((unit) => {
            if (unit.coords.y < 29 && unit.coords.x < 87) { 
                booleanMatrix[unit.coords.y][unit.coords.x] = 1;
            }
        });
        buildings.forEach((element) => {
            const [bx, by] = [element.coords[0].x, element.coords[0].y];
            if (element.size === 1) {
                if (by < 29 && bx < 87) booleanMatrix[by][bx] = 1;
            } else {
                if (by < 29 && bx < 87) booleanMatrix[by][bx] = 1;
                if (by + 1 < 29 && bx < 87) booleanMatrix[by + 1][bx] = 1;
                if (by < 29 && bx + 1 < 87) booleanMatrix[by][bx + 1] = 1;
                if (by + 1 < 29 && bx + 1 < 87) booleanMatrix[by + 1][bx + 1] = 1;
            }
        });
        return booleanMatrix;
    }

    private getMatrixForWalls(units: Unit[], buildings: Building[]): number[][] {
        let matrix: number[][] = Array(29).fill(null).map(() => Array(87).fill(0));
        for (let i = 0; i < 29; i++) {
            matrix[i] = new Array(87).fill(0);
        }
        units.forEach((element) => {
            if (element.coords.y < 29 && element.coords.x < 87) {
                matrix[element.coords.y][element.coords.x] = 2;
            }
        });
        buildings.forEach((element) => {
            const [bx, by] = [element.coords[0].x, element.coords[0].y];
            if (element.size === 1) {
                if (by < 29 && bx < 87) matrix[by][bx] = 1;
            } else {
                if (by < 29 && bx < 87) matrix[by][bx] = 1;
                if (by + 1 < 29 && bx < 87) matrix[by + 1][bx] = 1;
                if (by < 29 && bx + 1 < 87) matrix[by][bx + 1] = 1;
                if (by + 1 < 29 && bx + 1 < 87) matrix[by + 1][bx + 1] = 1;
            }
        })
        return matrix;
    }

    private updateAllWallSprites(): void {
        const { units, buildings } = this.getScene();
        
        buildings.forEach(building => {
            if (building.typeId === 4) {
                const wallSpriteIndex = this.calculateWallSprite(building.coords[0].x, building.coords[0].y, units, buildings);
                building.updateWallSprite(wallSpriteIndex);
            }
        });
    }

    private calculateWallSprite(x: number, y: number, units: Unit[], buildings: Building[]): number {
        const matrix = this.getMatrixForWalls(units, buildings);

        const up = y > 0 ? matrix[y - 1][x] : 0;
        const down = y < 28 ? matrix[y + 1][x] : 0;
        const left = x > 0 ? matrix[y][x - 1] : 0;
        const right = x < 86 ? matrix[y][x + 1] : 0;

        if (up === 1 && down === 1 && left === 1 && right === 1) return 41;
        if (left === 1 && down === 1 && up === 1 && right !== 1) return 90;
        if (right === 1 && left === 1 && up === 1 && down !== 1) return 89;
        if (right === 1 && down === 1 && up === 1 && left !== 1) return 88;
        if (right === 1 && left === 1 && down === 1 && up !== 1) return 87;
        if (left === 1 && up === 1 && down !== 1 && right !== 1) return 86;
        if (right === 1 && up === 1 && down !== 1 && left !== 1) return 85;
        if (right === 1 && down === 1 && up !== 1 && left !== 1) return 84;
        if (left === 1 && down === 1 && up !== 1 && right !== 1) return 83;
        if ((left === 1 || right === 1) && up !== 1 && down !== 1) return 82;
        if ((up === 1 || down === 1) && left !== 1 && right !== 1) return 81;
        
        return 81;
    }

    private updateAllGateSprites(): void {
        const { buildings } = this.getScene();
        
        buildings.forEach(building => {
            if (building.typeId === BuildingTypeID.Gates) {
                const [x, y] = [building.coords[0].x, building.coords[0].y];
                const gateSpriteId = this.calculateGateSprite(x, y, buildings);
                building.updateGateSprite(gateSpriteId); 
            }
        });
    }

    private calculateGateSprite(x: number, y: number, buildings: Building[]): number { 
        const isWall = (tx: number, ty: number): boolean => {
            if (ty < 0 || ty >= 29 || tx < 0 || tx >= 87) return false;
            
            return buildings.some(b => 
                b.typeId === BuildingTypeID.Wall && 
                b.coords.some(c => c.x === tx && c.y === ty)
            );
        };
        
        const wallLeft = isWall(x - 1, y) && isWall(x - 1, y + 1);
        const wallRight = isWall(x + 2, y) && isWall(x + 2, y + 1);
        
        const wallUp = isWall(x, y - 1) && isWall(x + 1, y - 1);
        const wallDown = isWall(x, y + 2) && isWall(x + 1, y + 2);
        
        if (wallLeft && wallRight) {
            return 91; 
        } 
        
        if (wallUp && wallDown) {
            return 92; 
        }

        return 91; 
    }

    public isTileOccupiedByBuilding(x: number, y: number): boolean {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        return this.game.getBuildings().some(b => {
            if (b.size === 2) {
                const [bx, by] = [b.coords[0].x, b.coords[0].y];
                return gridX >= bx && gridX < bx + 2 && gridY >= by && gridY < by + 2;
            }
            const [bx, by] = [b.coords[0].x, b.coords[0].y];
            return gridX === bx && gridY === by;
        });
    }

}

export default Village;