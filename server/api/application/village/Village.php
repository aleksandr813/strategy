<?php

class Village {
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getIncome($userId) {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 310];
        }
        $mine = $this->db->getMine($village->id);
        if (!$mine) {
            return ['error' => 410];
        }

        $lastIncome = strtotime($village->last_income_datetime);
        $now = time();
        $diffSeconds = $now - $lastIncome;

        if ($diffSeconds < 10) {
            return [
                'money' => $this->db->getMoney($userId)->money
            ];
        }

        $currentMoney = $this->db->getMoney($userId);
        $income = $mine->level * 10;
        $newMoney = $currentMoney->money + $income;

        $this->db->updateMoney($userId, $newMoney);
        $this->db->updateLastIncome($village->id);
        
        return ['money' => $this->db->getMoney($userId)->money];
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

    public function deleteBuilding($buildingId, $villageId) {
        $result = $this->db->deleteBuilding($buildingId, $villageId);
        if (!$result) {
            return ['error' => 303];
        }

        return true;
    }

    public function getUnits($userId)
    {
        if (!$userId) {
            return ['error' => 705];
        }
        $units = $this->db->getUnits($userId);

        return ["units" => $units];
    }

    public function buyUnit($user, $typeId, $x, $y)
    {
        $village = $this->db->getVillage($user->id);
        if (!$village) {
            return ['error' => 310];
        }
        $unit = $this->db->getUnitType($typeId);
        if (!$unit) {
            return ["error" => 501];
        }
        if ($user->money < $unit->price) {
            return ['error' => 305];
        }

        $existingUnit = $this->db->isOccupied($village->id, $x, $y);
        if ($existingUnit) {
            return ['error' => 311];
        }

        $newMoney = $user->money - $unit->price;
        $this->db->updateMoney($user->id, $newMoney);
        $this->db->buyunit(
            $village->id,
            $typeId,
            $x,
            $y,
            $unit->hp
        );

        return [
            'money' => $newMoney
        ];
    }

    public function updateUnit($unitId, $userId, $unitType, $x, $y)
    {
        $result = $this->db->updateUnit($unitId, $userId, $unitType, $x, $y);
        if ($result) {
            return [
                'id' => $unitId,
                'user_id' => $userId,
                'unit_type' => $unitType,
                'x' => $x,
                'y' => $y
            ];
        }
        return ['error' => 502];
    }

    public function deleteUnit($unitId, $userId)
    {
        $result = $this->db->deleteUnit($unitId, $userId);
        if (!$result) {
            return ['error' => 503];
        }

    }

    public function getUnitTypes()
    {
        $types = $this->db->getUnitTypes();
        return ["unit_types" => $types];
    }
}