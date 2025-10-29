import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Building from './Buildings/Building';
import EasyStar from 'easystarjs';
import Allocation from "../pages/Village/UI/Allocation";
import BuildingPreview from "../pages/Village/UI/BuildingPreview";
import UnitPreview from "../pages/Village/UI/UnitPreview";
import Server from "../services/server/Server";
import VillageManager from "../pages/Village/villageDataManager";
import Store from "../services/store/Store";
import Game from "./Game";
const { WIDTH, HEIGHT } = CONFIG;

class Village extends Game{
    private buildingPreview;
    private unitPreview;
    private store;
    private server;
    private villageManager;
    

    constructor(store: Store, server: Server) {
        super()
        this.store = store
        this.server = server
        this.units = []
        this.buildings = []
        this.allocation = new Allocation;
        this.buildingPreview = new BuildingPreview();
        this.unitPreview = new UnitPreview();
        this.villageManager = new VillageManager(server)
    }

    public selectedBuilding: Building | null = null;  

    public selectBuilding(building: Building | null): void {
        this.buildings.forEach(b => b.deselected?.());
        if (building) building.selected?.();
        
        this.selectedBuilding = building;
    }


    setBuildings(buildings: Building[]): void {
        this.buildings = buildings;
    }
    
    getBuildings(): Building[] {
        return this.buildings;
    }

    setUnits(units: Unit[]): void {
        this.units = units;
    }
    
    getUnits(): Unit[] {
        return this.units;
    }

    async loadBuildings() {
        console.log("Загружаем здания из Game...");
        const buildingObjects = await this.villageManager.loadBuildings();

        this.buildings = buildingObjects;
        console.log("Загружено зданий:", this.buildings.length);
    }

    async loadUnits() {
        console.log("Загружаем юнитов из Game...");
        const unitObjects = await this.villageManager.loadUnits();

        this.units = unitObjects;
        console.log("Загружено юниов:", this.units.length);
    }
    

    destructor() {

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

    getVillageMatrix(units:Unit[], buildings:Building[]):number[][] {
        let booleanMatrix:number[][] = Array(29).fill(null).map(() => Array(87).fill(0));
        for (let i = 0; i < 29; i++) {
            booleanMatrix[i] = new Array(87).fill(0);
        }
        units.forEach((element) => {
            booleanMatrix[element.cords[0].x][element.cords[0].y] = 1;
        })
        buildings.forEach((element) => {
            booleanMatrix[element.cords[0].y][element.cords[0].x] = 1;
            booleanMatrix[element.cords[0].y + 1][element.cords[0].x] = 1;
            booleanMatrix[element.cords[0].y][element.cords[0].x + 1] = 1;
            booleanMatrix[element.cords[0].y + 1][element.cords[0].x + 1] = 1;
        })
        return booleanMatrix;
    }

}

export default Village;