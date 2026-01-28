import EasyStar from 'easystarjs';
import Store from "../services/store/Store";
import Server from "../services/server/Server";
import Mediator from '../services/mediator/Mediator';
import GlobalMap from "./manager/GlobalMap";
import Village from "./manager/Village";
import Battle from "./manager/Battle";
import Unit from './entities/Unit';
import VillageEntity from './entities/VillageEntity';
import ArmyEntity from './entities/ArmyEntity';
import Building from './entities/Building';
import { BuildingTypeID } from '../services/server/types';
import { TActiveBattle, TAnswer } from '../services/server/types';
import GAMECONFIG from './gameConfig';

const { GRID_HEIGHT, GRID_WIDTH } = GAMECONFIG;

class Game {
    private store: Store;
    private server: Server;
    private mediator: Mediator;
    private easyStar: EasyStar.js;
    
    private units: Unit[] = [];
    private buildings: Building[] = [];
    private villages: VillageEntity[] = [];
    private armies: ArmyEntity[] = [];
    private activeBattles: TActiveBattle | null = null;
    private currentBattleId: number | null = null;
    
    private incomeInterval: NodeJS.Timer | null = null;
    private activeBattlesInterval: NodeJS.Timer | null = null;
    
    public village: Village;
    public globalMap: GlobalMap | null = null;
    public battle: Battle;

    constructor(store: Store, server: Server, mediator: Mediator) {
        this.store = store;
        this.server = server;
        this.mediator = mediator;
        this.easyStar = new EasyStar.js();
        
        this.village = new Village(store, server, this.mediator, this.easyStar, this);
        this.battle = new Battle(store, server, this, this.easyStar);
        
        this.startIncomeUpdate();
        this.startActiveBattlesUpdate();
    }

    private startIncomeUpdate(): void {
        this.updateIncome();
        
        this.incomeInterval = setInterval(() => {
            this.updateIncome();
        }, GAMECONFIG.INCOME_INTERVAL);
    }

    getMatrixForEasyStar(units: Unit[], buildings: Building[]): number[][] {
        const matrix: number[][] = Array.from(
            { length: GRID_HEIGHT }, 
            () => Array(GRID_WIDTH).fill(0)
        );
        
        units.forEach((unit) => {
            if (unit.coords.y < GRID_HEIGHT && unit.coords.x < GRID_WIDTH) {
                matrix[unit.coords.y][unit.coords.x] = 1;
            }
        });
        
        buildings.forEach((building) => {
            if (building.typeId === BuildingTypeID.Wall) {
                const { x, y } = building.coords[0];
                if (y < GRID_HEIGHT && x < GRID_WIDTH) {
                    matrix[y][x] = 1;
                }
            } else {
                const { x, y } = building.coords[0];
                for (let dy = 0; dy <= 1; dy++) {
                    for (let dx = 0; dx <= 1; dx++) {
                        if (y + dy < GRID_HEIGHT && x + dx < GRID_WIDTH) {
                            matrix[y + dy][x + dx] = 1;
                        }
                    }
                }
            }
        });
        
        return matrix;
    }

    private async updateIncome(): Promise<void> {
        if (!this.store.user) return;
        await this.server.getIncome();
    }

    public getArmies(): ArmyEntity[] {
        return this.armies;
    }

    public setArmies(armies: ArmyEntity[]): void {
        this.armies = armies;
    }

    public getVillages(): VillageEntity[] {
        return this.villages;
    }

    public setVillages(villages: VillageEntity[]): void {
        this.villages = villages;
    }

    public getUnits(): Unit[] {
        return this.units;
    }

    public setUnits(units: Unit[]): void {
        this.units = units;
    }

    public addUnit(unit: Unit): void {
        this.units.push(unit);
    }

    public removeUnit(unit: Unit): void {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    }

    public getBuildings(): Building[] {
        return this.buildings;
    }

    public getActiveBattles(): TActiveBattle | null {
        return this.activeBattles;
    }

    public setActiveBattles(data: TActiveBattle): void {
        this.activeBattles = data;
    }

    async updateActiveBattles(): Promise<void> {
        if (!this.store.user) return;
        const data = await this.server.getActiveBattles();

        if (!data) return;

        this.activeBattles = data;
        this.mediator.call('UPDATE_BATTLES');
    }


    private startActiveBattlesUpdate(): void {
        this.updateIncome();
        this.updateActiveBattles();
        
        this.activeBattlesInterval = setInterval(() => {
            this.updateActiveBattles();
        }, GAMECONFIG.INCOME_INTERVAL);
    }

    public setBuildings(buildings: Building[]): void {
        this.buildings = buildings;
    }

    public addBuilding(building: Building): void {
        this.buildings.push(building);
    }

    public async removeBuilding(building: Building): Promise<void> {
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
        }
        await this.server.deleteBuilding(building.id);
    }

    public getEasyStar(): EasyStar.js {
        return this.easyStar;
    }

    public getVillage(): Village {
        return this.village;
    }

    public getGlobalMap(): GlobalMap {
        if (!this.globalMap) {
            this.globalMap = new GlobalMap(this.store, this.server, this, this.mediator);
            console.log("Global map создана");
        }

        return this.globalMap;
    }

    public resetGlobalMap(): void {
        if (this.globalMap) {
            this.globalMap.destructor();
            console.log("Global map сброшена");
        }
    }

    public getBattle(): Battle {
        return this.battle;
    }

    public setCurrentBattle(id: number): void {
        this.currentBattleId = id;
    }

    public getCurrentBattle(): number | null {
        return this.currentBattleId;
    }

    public clearCurrentBattle(): void {
        this.currentBattleId = null;
    }

    public destructor(): void {
        if (this.incomeInterval) {
            clearInterval(this.incomeInterval);
            this.incomeInterval = null;
        }
        
        this.village.destructor();
        this.resetGlobalMap();
        this.battle.destructor();
    }

    public async sendUpdateBattle(): Promise<void> {
        const battleId = this.getCurrentBattle();
        if (battleId !== null) {
            const unitsToUpdate = this.units.map(unit => ({
                id: unit.id,
                x: unit.coords.x,
                y: unit.coords.y
            }));

            console.log('Отправка обновления битвы...', unitsToUpdate);
            const result = await this.server.getUpdateBattle(battleId, unitsToUpdate);
            const fakeBattleEnd = true;

        if (fakeBattleEnd) {
            this.mediator.call('BATTLE_END', {
                isWinner: true,
                loot: {
                    gold: 300
                }
            });
        }
            
            console.log('Результат обновления:', result);
        }
    }      
}

export default Game;