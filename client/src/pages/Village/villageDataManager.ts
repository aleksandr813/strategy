import Building from "../../game/entities/Building";
import Unit from "../../game/entities/Unit";
import Server from "../../services/server/Server";
import { TBuilding, BuildingType, BuildingTypeResponse, TUnit, UnitTypeResponse, UnitType } from "../../services/server/types";

export default class VillageManager {
    private server: Server;

    constructor(server: Server) {
        this.server = server;
    }

    async loadBuildingTypes(): Promise<BuildingType[]> {
        console.log("Loading building types...");
        const response = await this.server.getBuildingTypes();

        if (!response || !response.buildingTypes) {
            console.log('No building types to load');
            return [];
        }

        console.log('Building types response:', response);

        const buildingTypes: BuildingType[] = response.buildingTypes.map((bt: BuildingTypeResponse) => ({
            id: Number(bt.id),
            type: bt.type,
            name: bt.name,
            hp: Number(bt.hp),
            price: Number(bt.price),
            sprite: Number(bt.spriteId)
        }));

        console.log("Loaded building types:", buildingTypes.length);
        return buildingTypes;
    }

    async loadUnitTypes(): Promise<UnitType[]> {
        console.log("Loading unit types...");
        const response = await this.server.getUnitsTypes();

        if (!response || !response.unitTypes) {
            console.log('No unit types to load');
            return [];
        }

        console.log('Unit types response:', response);

        const unitTypes: UnitType[] = response.unitTypes.map((ut: UnitTypeResponse) => ({
            id: Number(ut.id),
            type: ut.type,
            name: ut.name,
            hp: Number(ut.hp),
            price: Number(ut.price)
        }));

        console.log("Loaded unit types:", unitTypes.length);
        return unitTypes;
    }

    async loadUnits(): Promise<Unit[]> {
        console.log("Loading units from server...");
        
        const unitsData = await this.server.getUnits();
        
        if (!unitsData) {
            console.log('No units to load');
            return [];
        }

        console.log("Units data from server:", unitsData);

        const units: Unit[] = unitsData.map((unitData: TUnit) => new Unit(unitData));

        console.log("Loaded units:", units.length);
        return units;
    }
}