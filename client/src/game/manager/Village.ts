import EasyStar from 'easystarjs';
import CONFIG, { TPoint } from "../../config";
import BuildingPreview from "../../services/canvas/BuildingPreview";
import UnitPreview from "../../services/canvas/UnitPreview";
import Server from "../../services/server/Server";
import Store from "../../services/store/Store";
import Unit from '../entities/Unit';
import Building from '../entities/Building';
import Game from '../Game';
import Manager, { GameData } from "./Manager";
import { BuildingTypeID } from '../../services/server/types';

const { WIDTH, HEIGHT } = CONFIG;

class Village extends Manager {
    private buildingPreview: BuildingPreview;
    private unitPreview: UnitPreview;
    private store: Store;
    private server: Server;
    private game: Game;
    public selectedBuilding: Building | null = null;
    public selectedUnit: Unit | null = null;
    public easyStar: EasyStar.js;

    constructor(store: Store, server: Server, gameData: GameData, easyStar: EasyStar.js, game: Game) {
        super(gameData);
        this.store = store;
        this.server = server;
        this.easyStar = easyStar;
        this.game = game;
        this.buildingPreview = new BuildingPreview(game);
        this.unitPreview = new UnitPreview(game);
    }

    public selectBuilding(building: Building | null): void {
        this.gameData.getBuildings().forEach(b => b.deselected?.());
        if (building) building.selected?.();
        this.selectedBuilding = building;
    }

    public getBarracksLevel(): number {
        const buildings = this.gameData.getBuildings();
        const barracks = buildings.find(
            (b) => b.typeId === BuildingTypeID.Kazarma
        );
        return barracks ? barracks.level : 0;
    }

    public getTownHallLevel(): number {
        const buildings = this.gameData.getBuildings();
        const townHall = buildings.find(
            (b) => b.typeId === BuildingTypeID.TownHall
        );
        return townHall ? townHall.level : 0;
    }
    
    public selectUnit(unit: Unit | null): void {
        this.gameData.getUnits().forEach(u => u.updateSelection(false));
        if (unit) {
            unit.updateSelection(true);
        }
        this.selectedUnit = unit;
    }

    public async removeBuilding(building: Building): Promise<void> {
        this.gameData.removeBuilding(building);
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
        }
    }

    public async handleUnitPlacement(): Promise<void> {
        if (!this.unitPreview.tryPlace()) return;

        const typeId = this.unitPreview.getUnitTypeId();
        const position = this.unitPreview.getPlacementPosition();

        const result = await this.server.buyUnit(typeId, position.x, position.y);

        if (result) {
            await this.loadUnits();
        }
    }

    public handleBuildingClick(x: number, y: number): void {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        const clickedBuilding = this.gameData.getBuildings().find(b => {
            const [bx, by] = [b.coords[0].x, b.coords[0].y];
            return gridX >= bx && gridX < bx + 2 && gridY >= by && gridY < by + 2; 
        }) || null;

        if (clickedBuilding) {
            console.log("Выбранное здание", clickedBuilding);
            clickedBuilding.takeDamage(10);
        }
        
        this.selectBuilding(clickedBuilding);
    }

    public handleUnitClick(x: number, y: number): Unit | null {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        const clickedUnit = this.gameData.getUnits().find(u => {
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

            if (buildingData.typeId === 6) {
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

        this.gameData.setBuildings(buildings);
        this.updateAllWallSprites();
        console.log("Загружено зданий:", this.gameData.getBuildings().length);
    }

    async loadUnits(): Promise<void> {
        console.log("Загружаем юнитов из сервера...");
        
        const unitsData = await this.server.getUnits();
        if (!unitsData) {
            console.log('Нету юнитов для загрузки');
            return;
        }

        const units = unitsData.map(unitData => new Unit(unitData, this.game, this.easyStar));
        
        this.gameData.setUnits(units);
        console.log("Загружено юнитов:", this.gameData.getUnits().length);
    }

    getScene() {
        return {
            units: this.gameData.getUnits(),
            buildings: this.gameData.getBuildings(),
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

}

export default Village;