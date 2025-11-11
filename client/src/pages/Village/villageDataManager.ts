import Building from "../../game/Entities/Building";
import Unit from "../../game/Entities/Unit";
import Server from "../../services/server/Server";
import { TBuilding, BuildingType, BuildingTypeResponse, UnitResponse, UnitTypeResponse,UnitType } from "../../services/server/types";
import { ServerContext } from "../../App";    

export default class VillageManager {

    private server;

    constructor(server: Server) {
        this.server = server
    }

    async loadBuildings(): Promise<TBuilding[] | null> {
        const buildingsResponse = await this.server.getBuildings();

        if (buildingsResponse){
            return buildingsResponse;
        }
        return null

    }

    async loadBuildingTypes() {
        try {
            const response = await this.server.getBuildingTypes();
            
            if (response && response.buildingTypes && response.buildingTypes.length > 0) {
                const convertedTypes: BuildingType[] = response.buildingTypes.map((type: BuildingTypeResponse) => ({
                    id: Number(type.id),
                    type: type.type,
                    name: type.name,
                    hp: Number(type.hp),
                    price: Number(type.price),
                    sprite: Number(type.spriteId)
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
        const types: UnitTypeResponse[] = typesResponse.unitTypes;

        return units
        .map((u) => {
        const typeData = types.find((t) => Number(t.id) === Number(u.typeId));
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
            typeId: Number(u.typeId),
            villageId: Number(u.villageId),
            x: Number(u.x),
            y: Number(u.y),
            currentHp: Number(u.currentHp),
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
            
            if (response && response.unitTypes && response.unitTypes.length > 0) {
                const convertedTypes: UnitType[] = response.unitTypes.map((type: UnitTypeResponse) => ({
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
