import Building from "../../game/Buildings/Building";
import Server from "../../services/server/Server";
import { Building as BuildingData, BuildingType, BuildingResponse, BuildingTypeResponse } from "../../services/server/types";

export default class VillageManager {
    static async loadAll(server: Server): Promise<Building[]> {
        const [buildingsResponse, typesResponse] = await Promise.all([
            server.getBuildings(),
            server.getBuildingTypes(),
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
      console.log(`Building Type ID: ${type.id}, Sprite ID: ${type.sprite}`);

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
  })
  .filter(Boolean) as Building[];

    }
}
