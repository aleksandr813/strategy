import Store from "../../services/store/Store";
import Server from "../../services/server/Server";
import VillageEntity from "../entities/VillageEntity";
import ArmyEntity from "../entities/ArmyEntity";
import Manager, { GameData } from "../manager/Manager";
import GAMECONFIG from '../gameConfig';
import { TVillage, TArmy, TMap } from "../../services/server/types"; // Добавил импорт типов

class GlobalMap extends Manager {
    private store: Store;
    private server: Server;
    private mapUpdateInterval: NodeJS.Timer | null = null;

    constructor(store: Store, server: Server, gameData: GameData) {
        super(gameData);
        this.store = store;
        this.server = server;
        
        this.startMapUpdate();
    }

    private startMapUpdate(): void {
        this.updateMap();
        
        this.mapUpdateInterval = setInterval(() => {
            this.updateMap();
        }, GAMECONFIG.MAP_UPDATE_INTERVAL);
    }

    private async updateMap(): Promise<void> {
        if (!this.store.user) return;
        const mapResponse = await this.server.getMap();
        
        if (mapResponse) {
            const mapData = mapResponse.mapData;
            
            if (mapData.villages) {
                await this.loadVillages(mapResponse.mapData.villages);
            }
            
            if (mapData.armies) {
                this.loadArmies(mapResponse.mapData.armies);
            }
        }
    }

    private async loadVillages(villagesData: TVillage[]): Promise<void> {
        const villages = villagesData.map(villageData => 
            new VillageEntity(villageData.id, { x: villageData.x, y: villageData.y })
        );
        
        this.gameData.setVillages(villages);
        //console.log("Загружено деревень:", villages.length);
    }

    private loadArmies(armiesData: TArmy[]): void {        
        const armies = armiesData.map(armyData => 
            new ArmyEntity(armyData.id, { x: armyData.currentX, y: armyData.currentY })
        );
        
        this.gameData.setArmies(armies);
        //console.log("Загружено армий:", armies.length);
    }

    getMap() {
        return {
            armies: this.gameData.getArmies(),
            villages: this.gameData.getVillages(),
        };
    }

    destructor(): void {
        if (this.mapUpdateInterval) {
            clearInterval(this.mapUpdateInterval);
            this.mapUpdateInterval = null;
        }
    }
}

export default GlobalMap;