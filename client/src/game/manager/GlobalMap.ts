import Store from "../../services/store/Store";
import Server from "../../services/server/Server";
import VillageEntity from "../entities/VillageEntity";
import ArmyEntity from "../entities/ArmyEntity";
import Manager from "../manager/Manager";
import Game from '../Game';
import GAMECONFIG from '../gameConfig';
import { TVillage, TArmy, TUserArmy } from "../../services/server/types";

class GlobalMap extends Manager {
    private store: Store;
    private server: Server;
    private selectedVillage: VillageEntity | null = null;
    public sendingArmy = false;
    private mapUpdateInterval: NodeJS.Timer | null = null;

    constructor(store: Store, server: Server, game: Game) {
        super(game);
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

        if (mapResponse?.hash) {
            this.store.setMapHash(mapResponse.hash);
        }
        
        if (mapResponse) {
            const mapData = mapResponse.mapData;
            if (!mapData) return;
            
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
            new VillageEntity(villageData.id, { x: villageData.x, y: villageData.y }, villageData.name)
        );
        
        this.game.setVillages(villages);
    }

    private loadArmies(armiesData: TArmy[]): void {        
        const armies = armiesData.map(armyData => 
            new ArmyEntity(armyData.id, { x: armyData.currentX, y: armyData.currentY })
        );
        
        this.game.setArmies(armies);
    }

    public async getUserArmies(): Promise<TUserArmy[]> {
        const armiesData = await this.server.getUserArmies();
        if (armiesData) {
            return armiesData;
        }
        return [];
    }

    public async moveArmyBack(armyId: number): Promise<void> {
        const armiesBack = await this.server.moveArmyBack(armyId);
        if (!armiesBack) {
            console.error('Ошибка возврата армии');
            return
        }
        await this.game.village.loadUnits();
    }

    public selectVillage(village: VillageEntity | null): void {
        this.game.getVillages().forEach(v => v.deselected?.());
        if (!village) return;
        this.selectedVillage = village;
        console.log(11111111111);
    }

    public handleVillageClick(x: number, y: number): void {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        
        const clickedVillage = this.game.getVillages().find(v => {
            const [vx, vy] = [v.coords.x, v.coords.y];
            return gridX >= vx && gridX < vx + 2 && gridY >= vy && gridY < vy + 2; 
        }) || null;
        
        this.selectVillage(clickedVillage);
    }


    public getSelectedVillage(): VillageEntity | null {
        return this.selectedVillage;
    }

    getMap() {
        return {
            armies: this.game.getArmies(),
            villages: this.game.getVillages(),
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