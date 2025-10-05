<?php

class Building {
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getBuildingById($buildingId) {
        $building = $this->db->getBuildingById($buildingId);
        if (!$building) {
            return ['error' => 300];
        }

        return [
            'id' => $building->id,
            'user_id' => $building->user_id,
            'building_type' => $building->building_type,
            'x' => $building->x,
            'y' => $building->y
        ];
    }

    public function getBuildings($userId) {
        if (!$userId) {
            return ['error' => 705];
        }
        $buildings = $this->db->getBuildings($userId);
        return ['buildings' => $buildings];
    }

    public function getBuildingTypes() {
        $types = $this->db->getBuildingTypes();
        return ["building_types" => $types];
    }

    public function buyBuilding($user, $typeId, $x, $y) {
        $village = $this->db->getVillageByUserId($user->id);
        if (!$village) {
            return ['error' => 310];
        }
        $building = $this->db->getBuildingType($typeId);
        if (!$building) {
            return ["error" => 301];
        }
        if ($user->money < $building->price) {
            return ['error' => 305];
        }

        $existingBuilding = $this->db->getPositionBuilding($village->id, $x, $y);
        if ($existingBuilding) {
            return ['error' => 311];
        }

        $newMoney = $user->money - $building->price;
        $this->db->updateMoney($user->id, $newMoney);
        $this->db->buyBuilding(
            $village->id,
            $typeId,
            $x,
            $y,
            $building->hp
        );

        return [
            'money' => $newMoney
        ];
    }

    public function updateBuilding($buildingId, $userId, $buildingType, $x, $y) {
        $result = $this->db->updateBuilding($buildingId, $userId, $buildingType, $x, $y);
        if ($result) {
            return [
                'id' => $buildingId,
                'user_id' => $userId,
                'building_type' => $buildingType,
                'x' => $x,
                'y' => $y
            ];
        }

        return ['error' => 302];
    }

    public function deleteBuilding($buildingId, $userId) {
        $result = $this->db->deleteBuilding($buildingId, $userId);
        if (!$result) {
            return ['error' => 303];
        }

        return true;
    }
}