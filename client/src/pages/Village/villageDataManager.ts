import Building from "../../game/Buildings/Building";
import Unit from "../../game/Units/Unit";
import Server from "../../services/server/Server";
import { Building as BuildingData, BuildingType, BuildingResponse, BuildingTypeResponse, UnitResponse, UnitTypeResponse,UnitType } from "../../services/server/types";
import { ServerContext } from "../../App";    

export default class VillageManager {

    private server;

    constructor(server: Server) {
        this.server = server
    }

    async loadBuildings(): Promise<Building[]> {
        const [buildingsResponse, typesResponse] = await Promise.all([
            this.server.getBuildings(),
            this.server.getBuildingTypes(),
        ]);

        console.log("Buildings response:", buildingsResponse);
        console.log("Building types response:", typesResponse);

        const buildings: BuildingResponse[] = buildingsResponse.buildings;
        const types: BuildingTypeResponse[] = typesResponse.building_types;

        return buildings
        .map((b) => {
        const typeData = types.find((t) => Number(t.id) === Number(b.type_id));
        if (!typeData) return null;

        const type: BuildingType = {
            id: Number(typeData.id),
            type: typeData.type,
            name: typeData.name,
            hp: Number(typeData.hp),
            price: Number(typeData.price),
            sprite: Number(typeData.sprite_id)
        };

        const buildingData = {
            ...b,
            id: Number(b.id),
            type_id: Number(b.type_id),
            village_id: Number(b.village_id),
            x: Number(b.x),
            y: Number(b.y),
            current_hp: Number(b.current_hp),
            level: Number(b.level),
        };

        const building = new Building(buildingData, type);
        return building;
        }
        ).filter(Boolean) as Building[];
    }

    async loadBuildingTypes() {
        try {
            const response = await this.server.getBuildingTypes();
            
            if (response && response.building_types && response.building_types.length > 0) {
                const convertedTypes: BuildingType[] = response.building_types.map((type: BuildingTypeResponse) => ({
                    id: Number(type.id),
                    type: type.type,
                    name: type.name,
                    hp: Number(type.hp),
                    price: Number(type.price),
                    sprite: Number(type.sprite_id)
                }));
                console.log('Типы зданий успешно загруженны')
                return (convertedTypes);
            } else {
                console.error('Пустой массив типов зданий');
                return []
            }
        } catch (error) {
            console.error('Ошибка получения типов зданий:', error);
            return []
        }
    };

    async loadUnits(): Promise<Unit[]> {
        const [unitsResponse, typesResponse] = await Promise.all([
            this.server.getUnits(),
            this.server.getUnitsTypes(),
        ]);

        console.log("Units response:", unitsResponse);
        console.log("Unit types response:", typesResponse);

        const units: UnitResponse[] = unitsResponse.units;
        const types: UnitTypeResponse[] = typesResponse.unit_types;

        return units
        .map((u) => {
        const typeData = types.find((t) => Number(t.id) === Number(u.type_id));
        if (!typeData) return null;

        const type: UnitType = {
            id: Number(typeData.id),
            type: typeData.type,
            name: typeData.name,
            hp: Number(typeData.hp),
            price: Number(typeData.price),
        };

        const unitData = {
            ...u,
            id: Number(u.id),
            type_id: Number(u.type_id),
            village_id: Number(u.village_id),
            x: Number(u.x),
            y: Number(u.y),
            current_hp: Number(u.current_hp),
            level: Number(u.level),
        };

        const unit = new Unit(unitData, type);
        return unit;
        }
        ).filter(Boolean) as Unit[];
    }

    async loadUnitTypes() {
        try {
            const response = await this.server.getUnitsTypes();
            
            if (response && response.unit_types && response.unit_types.length > 0) {
                const convertedTypes: UnitType[] = response.unit_types.map((type: UnitTypeResponse) => ({
                    id: Number(type.id),
                    type: type.type,
                    name: type.name,
                    hp: Number(type.hp),
                    price: Number(type.price),
                }));
                console.log('Типы юнитов успешно загруженны')
                return (convertedTypes);
            } else {
                console.error('Пустой массив типов юнитов');
                return []
            }
        } catch (error) {
            console.error('Ошибка получения типов юнитов:', error);
            return []
        }
    };


}
