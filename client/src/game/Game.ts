import CONFIG, { TPoint } from "../config";
import Unit from './Units/Unit';
import Build from "./Buildings/Building";
import EasyStar from 'easystarjs';
import Allocation from "../pages/Village/UI/Allocation";
import { TBuildingFullData } from "../services/server/Server";

const { WIDTH, HEIGHT } = CONFIG;

class Game {
    private units:Unit[];
    private buildings:Building[];
    private allocation:Allocation;
    
    constructor() {
        this.units = [new Unit(5, 7), new Unit(0, 0)]
        this.builds = [] 
        this.allocation = new Allocation;
    }
    
    public loadBuildings(buildingData: TBuildingFullData[]): void {
        this.builds = buildingData
            .map(data => new Build(data)); 
        console.log(`[Game] Загружено ${this.builds.length} зданий из БД.`);
    }

    destructor() {
        //...
    }

    getScene() {
        return {
            units: this.units,
            buildings: this.buildings,
        };
    }

    getVillageMatrix(units:Unit[], buildings:Building[]):number[][] {
        let booleanMatrix:number[][] = new Array(29);
        for (let i = 0; i < 29; i++) {
            booleanMatrix[i] = new Array(29).fill(0);
        }
        units.forEach((element) => {
            booleanMatrix[element.cords.x][element.cords.y] = 1;
        })
        buildings.forEach((element) => {
            booleanMatrix[element.cords[0].x][element.cords[0].y] = 1;
            booleanMatrix[element.cords[0].x + 1][element.cords[0].y] = 1;
            booleanMatrix[element.cords[0].x][element.cords[0].y + 1] = 1;
            booleanMatrix[element.cords[0].x + 1][element.cords[0].y + 1] = 1;
        })
        return booleanMatrix;
    }

    moveUnits(destination: TPoint) {
        destination.x = Math.round(destination.x);
        destination.y = Math.round(destination.y);
        
        let easystar = new EasyStar.js();

        this.units.forEach((unit) => {
            if (!unit.isSelected) {
                return;
            }

            let booleanMatrix = this.getVillageMatrix(
                this.units.filter(u => u !== unit), 
                this.buildings
            );

            easystar.setGrid(booleanMatrix);
            easystar.setAcceptableTiles([0]);

            easystar.findPath(unit.cords.x, unit.cords.y, destination.x, destination.y, (path) => {
                if (path === null) {
                    console.log("Path was not found");
                } else {
                    path.shift();

                    let stepIndex = 0;
                    let intervalId = setInterval(() => {
                        if (stepIndex < path.length) {
                            const nextStep = path[stepIndex];
                            const currentMatrix = this.getVillageMatrix(
                                this.units.filter(u => u !== unit), 
                                this.buildings
                            );
                            
                            if (currentMatrix[nextStep.x][nextStep.y] === 0) {
                                unit.cords = nextStep;
                                stepIndex++;
                            }
                        } else {
                            clearInterval(intervalId);
                        }
                    }, 100);
                }
            });
        });

        easystar.calculate();
    }
}

export default Game;