<?php

class Building {
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
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
        $village = $this->db->getVillage($user->id);
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

        $existingBuilding = $this->db->isOccupied($village->id, $x, $y);
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

    public function upgradeBuilding($buildingId, $user, $typeId) {
        $village = $this->db->getVillage($user->id);
        if (!$village) {
            return ['error' => 310];
        }

        $level = $this->db->getLevel($buildingId, $village->id);
        if ($level->level >= 3) {
            return ['error' => 312];
        }

        $building = $this->db->getBuildingType($typeId);
        if (!$building) {
            return ["error" => 301];
        }

        if ($user->money < $building->price) {
            return ['error' => 305];
        }

        $newMoney = $user->money - $building->price;
        $this->db->updateMoney($user->id, $newMoney);
        $result = $this->db->upgradeBuilding($buildingId, $village->id);
        if (!$result) {
            return ['error' => 302];
        }

        return ['money' => $newMoney];
    }

    public function deleteBuilding($buildingId, $userId) {
        $result = $this->db->deleteBuilding($buildingId, $userId);
        if (!$result) {
            return ['error' => 303];
        }

        return true;
    }
}