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

    public function getBuildingsByUser($userId) {
        if (!$userId) {
            return ['error' => 705];
        }
        $buildings = $this->db->getBuildingsByUser($userId);
        return ['buildings' => $buildings];
    }

    public function buyBuilding($userId, $typeId, $villageId, $x, $y) {
        $userMoney = $this->db->getMoney($userId);

        $building = $this->db->buyBuilding($typeId, $villageId, $x, $y);

        if (!$building) {
            return ['error' => 301];
        }
        
        if ($userMoney->money < $building->price) {
            return ['error' => 305];
        }

        $newBalance = $userMoney->money - $building->price;
        $moneyUpdate = $this->db->updateMoney($userId, $newBalance);

        if (!$moneyUpdate) {
            return ['error' => 306];
        }

        return [
            'new_balance' => $newBalance
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

        
    }
}