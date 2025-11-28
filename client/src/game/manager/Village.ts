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
        this.buildingPreview = new BuildingPreview();
        this.unitPreview = new UnitPreview(game);
    }

    public selectBuilding(building: Building | null): void {
        this.gameData.getBuildings().forEach(b => b.deselected?.());
        if (building) building.selected?.();
        this.selectedBuilding = building;
    }

    public selectUnit(unit: Unit | null): void {
        this.gameData.getUnits().forEach(u => u.updateSelection(false));
        if (unit){
            unit.updateSelection(true)
        }
        this.selectedUnit = unit;
    }

    public removeBuilding(building: Building): void {
        this.gameData.removeBuilding(building);
        if (this.selectedBuilding === building) {
            this.selectedBuilding = null;
        }
    }

    async handleBuildingPlacement(server: Server) {
        const { buildingPreview } = this.getScene();
        
        if (!buildingPreview.isActiveStatus() || !buildingPreview.getCanPlace()) {
            return;
        }

        const typeId = buildingPreview.getBuildingTypeId();
        const position = buildingPreview.getPlacementPosition();
        
        const result = await server.buyBuilding(typeId, position.x, position.y);
        
        if (result) {
            buildingPreview.deactivate();
            await this.loadBuildings();
        }
    }

    public async handleUnitPlacement(x: number, y: number, server: Server): Promise<void> {
        const newUnit = this.unitPreview.tryPlace();
        if (!newUnit) return;

        const typeId = this.unitPreview.getUnitTypeId();
        const pos = this.unitPreview.getPlacementPosition();

        try {
            const result = await server.buyUnit(typeId, pos.x, pos.y);
            if (result) {
                this.gameData.addUnit(newUnit);
            } else {
                console.error('Ошибка размещения юнита:', result);
                this.unitPreview.activate(newUnit.sprites[0].toString(), typeId, newUnit.hp);
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
            this.unitPreview.activate(newUnit.sprites[0].toString(), typeId, newUnit.hp);
        }
    }

    public handleBuildingClick(x: number, y: number): void {
        const gridX = Math.floor(x), gridY = Math.floor(y);
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
        const gridX = Math.floor(x), gridY = Math.floor(y);
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
            return new Building(
                buildingData.id,
                buildingData.type,
                buildingData.currentHp, 
                buildingData.currentHp,
                buildingData.level,
                2,
                buildingData.typeId,
                buildingData.x,
                buildingData.y,   
            );
        });

        this.gameData.setBuildings(buildings);
        console.log("Загружено зданий:", this.gameData.getBuildings().length);
    }

    async loadUnits(): Promise<void> {
        console.log("Загружаем юнитов из сервера...");
        
        const unitsData = await this.server.getUnits();
        if (!unitsData) {
            console.log('Нету юнитов для загрузки');
            return;
        }

        const units = unitsData.map(unitData => new Unit(unitData, this.game));
        
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
        let booleanMatrix: number[][] = Array(29).fill(null).map(() => Array(87).fill(0));
        for (let i = 0; i < 29; i++) {
            booleanMatrix[i] = new Array(87).fill(0);
        }
        units.forEach((element) => {
            if (element.coords.y < 29 && element.coords.x < 87) { 
                booleanMatrix[element.coords.y][element.coords.x] = 1;
            }
        });
        buildings.forEach((element) => {
            const [bx, by] = [element.coords[0].x, element.coords[0].y];
            if (by < 29 && bx < 87) booleanMatrix[by][bx] = 1;
            if (by + 1 < 29 && bx < 87) booleanMatrix[by + 1][bx] = 1;
            if (by < 29 && bx + 1 < 87) booleanMatrix[by][bx + 1] = 1;
            if (by + 1 < 29 && bx + 1 < 87) booleanMatrix[by + 1][bx + 1] = 1;
        });
        return booleanMatrix;
    }
}

export default Village;