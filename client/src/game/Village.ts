import CONFIG, { TPoint } from "../config";
import Unit from './Entities/Unit';
import Building from './Entities/Building';
import BuildingPreview from "../services/canvas/BuildingPreview";
import UnitPreview from "../services/canvas/UnitPreview";
import Server from "../services/server/Server";
import VillageManager from "../pages/Village/villageDataManager";
import Store from "../services/store/Store";
import Manager from "./Manager";

const { WIDTH, HEIGHT } = CONFIG;

class Village extends Manager {
    private buildingPreview: BuildingPreview;
    private unitPreview: UnitPreview;
    private store: Store;
    private server: Server;
    private villageManager: VillageManager;
    public selectedBuilding: Building | null = null;

    constructor(store: Store, server: Server) {
        super();
        this.store = store;
        this.server = server;
        this.buildingPreview = new BuildingPreview();
        this.unitPreview = new UnitPreview();
        this.villageManager = new VillageManager(server);
    }

    public selectBuilding(building: Building | null): void {
        this.buildings.forEach(b => b.deselected?.());
        if (building) building.selected?.();
        this.selectedBuilding = building;
    }

    public async handleBuildingPlacement(x: number, y: number, server: Server): Promise<void> {
        const newBuilding = this.buildingPreview.tryPlace();
        if (!newBuilding) return;

        const typeId = this.buildingPreview.getBuildingTypeId();
        const pos = this.buildingPreview.getPlacementPosition();

        try {
            const result = await server.buyBuilding(typeId, pos.x, pos.y);
            if (result && !result.error) {
                this.addBuilding(newBuilding);
            }
            else {
                console.error('Ошибка при покупке здания:', result?.error || result);
                this.buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp); 
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
            this.buildingPreview.activate(newBuilding.sprites[0].toString(), typeId, newBuilding.hp);
        }
    }

    public async handleUnitPlacement(x: number, y: number, server: Server): Promise<void> {
        const newUnit = this.unitPreview.tryPlace();
        if (!newUnit) return;

        const typeId = this.unitPreview.getUnitTypeId();
        const pos = this.unitPreview.getPlacementPosition();

        try {
            const result = await server.buyUnit(typeId, pos.x, pos.y);
            if (result && !result.error) {
                this.addUnit(newUnit);
            } else {
                console.error('Ошибка размещения юнита:', result?.error || result);
                this.unitPreview.activate(newUnit.sprites[0].toString(), typeId, newUnit.hp);
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
            this.unitPreview.activate(newUnit.sprites[0].toString(), typeId, newUnit.hp);
        }
    }

    public handleBuildingClick(x: number, y: number): void {
        const gridX = Math.floor(x), gridY = Math.floor(y);
        const clickedBuilding = this.buildings.find(b => {
            const [bx, by] = [b.cords[0].x, b.cords[0].y];
            return gridX >= bx && gridX < bx + 2 && gridY >= by && gridY < by + 2; 
        }) || null;

        if (clickedBuilding) {
            console.log("Выбранное здание", clickedBuilding);
            clickedBuilding.takeDamage(10);
        }
        this.selectBuilding(clickedBuilding);
    }

    async loadBuildings(): Promise<void> {
        console.log("Загружаем здания из сервера...");
        const buildingObjects = await this.villageManager.loadBuildings();
        this.buildings = buildingObjects;
        console.log("Загружено зданий:", this.buildings.length);
    }

    async loadUnits(): Promise<void> {
        console.log("Загружаем юнитов из сервера...");
        const unitObjects = await this.villageManager.loadUnits();
        this.units = unitObjects;
        console.log("Загружено юниов:", this.units.length);
    }

    getScene() {
        return {
            units: this.units,
            buildings: this.buildings,
            buildingPreview: this.buildingPreview,
            unitPreview: this.unitPreview,
        };
    }

    addBuilding(building: Building): void {
        this.buildings.push(building);
    }

    addUnit(unit: Unit): void {
        this.units.push(unit);
    }

    removeBuilding(building: Building): void {
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
        }
    }

    getVillageMatrix(units: Unit[], buildings: Building[]): number[][] {
        let booleanMatrix: number[][] = Array(29).fill(null).map(() => Array(87).fill(0));
        for (let i = 0; i < 29; i++) {
            booleanMatrix[i] = new Array(87).fill(0);
        }
        units.forEach((element) => {
            if (element.cords.y < 29 && element.cords.x < 87) { 
                booleanMatrix[element.cords.y][element.cords.x] = 1;
            }
        });
        buildings.forEach((element) => {
            const [bx, by] = [element.cords[0].x, element.cords[0].y];
            if (by < 29 && bx < 87) booleanMatrix[by][bx] = 1;
            if (by + 1 < 29 && bx < 87) booleanMatrix[by + 1][bx] = 1;
            if (by < 29 && bx + 1 < 87) booleanMatrix[by][bx + 1] = 1;
            if (by + 1 < 29 && bx + 1 < 87) booleanMatrix[by + 1][bx + 1] = 1;
        });
        return booleanMatrix;
    }
}

export default Village;