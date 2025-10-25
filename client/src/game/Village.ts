import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Building from './Buildings/Building';
import EasyStar from 'easystarjs';
import Allocation from "../pages/Village/UI/Allocation";
import BuildingPreview from "../pages/Village/UI/BuildingPreview";
import Server from "../services/server/Server";
import VillageManager from "../pages/Village/villageDataManager";
import Store from "../services/store/Store";
import Game from "./Game";
const { WIDTH, HEIGHT } = CONFIG;

class Village extends Game{
    private buildingPreview;
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
        this.villageManager = new VillageManager(server)
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
        };
    }


    addBuilding(building: Building): void {
        this.buildings.push(building);
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
            booleanMatrix[element.cords.x][element.cords.y] = 1;
        })
        buildings.forEach((element) => {
            booleanMatrix[element.cords[0].y][element.cords[0].x] = 1;
            booleanMatrix[element.cords[0].y + 1][element.cords[0].x] = 1;
            booleanMatrix[element.cords[0].y][element.cords[0].x + 1] = 1;
            booleanMatrix[element.cords[0].y + 1][element.cords[0].x + 1] = 1;
        })
        return booleanMatrix;
    }

    moveUnits(destination: TPoint) {
        destination.x = Math.round(destination.x);
        destination.y = Math.round(destination.y);
        
        this.units.forEach((unit) => {
            if (!unit.isSelected) {
                return;
            }

            if (unit.moveIntervalId) {
                clearInterval(unit.moveIntervalId);
                unit.moveIntervalId = null;
            }

            let booleanMatrix = this.getVillageMatrix(
                this.units.filter(u => u !== unit), 
                this.buildings
            );

            if (destination.x+1 > booleanMatrix[0].length || destination.y+1 > booleanMatrix.length || destination.x < 0 || destination.y < 0) {
                return
            }

            this.easystar.setGrid(booleanMatrix);
            this.easystar.setAcceptableTiles(0);

            this.easystar.findPath(unit.cords.x, unit.cords.y, destination.x, destination.y, (path) => {
                if (path === null) {
                    console.log("Path was not found");
                } else {
                    path.shift();

                    let stepIndex = 0;
                    unit.moveIntervalId = setInterval(() => {
                        if (stepIndex < path.length) {
                            const nextStep = path[stepIndex];
                            const currentMatrix = this.getVillageMatrix(
                                this.units.filter(u => u !== unit), 
                                this.buildings
                            );
                            
                            if (currentMatrix[nextStep.y][nextStep.x] == 0) {
                                unit.cords = nextStep;
                                stepIndex++;
                            }
                        } else {
                            if (unit.moveIntervalId) {
                                clearInterval(unit.moveIntervalId);
                                unit.moveIntervalId = null;
                            }
                        }
                    }, 100);
                }
            });
        });

        this.easystar.calculate();
    }

}

export default Village;