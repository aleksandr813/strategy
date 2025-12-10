<?php
require_once('config.php');

class Village
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getIncome($userId)
    {
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

        if ($diffSeconds < INCOME_INTERVAL) {
            return [
                'money' => $this->db->getMoney($userId)->money
            ];
        }

        $currentMoney = $this->db->getMoney($userId);
        $income = $mine->level * INCOME_PER_LEVEL;
        $newMoney = $currentMoney->money + $income;

        $this->db->updateMoney($userId, $newMoney);
        $this->db->updateLastIncome($village->id);

        return ['money' => $this->db->getMoney($userId)->money];
    }

    public function getBuildings($userId)
    {
        if (!$userId) {
            return ['error' => 705];
        }
        $buildings = $this->db->getBuildings($userId);

        foreach ($buildings as &$building) {
            $building['id'] = (int)$building['id'];
            $building['typeId'] = (int)$building['typeId'];
            $building['villageId'] = (int)$building['villageId'];
            $building['x'] = (int)$building['x'];
            $building['y'] = (int)$building['y'];
            $building['level'] = (int)$building['level'];
            $building['currentHp'] = (int)$building['currentHp'];
        }

        if (count($buildings) === 0) {
            return [false];
        }

        return $buildings;
    }

    public function getBuildingTypes()
    {
        $types = $this->db->getBuildingTypes();
        return $types;
    }

    public function buyBuilding($user, $typeId, $x, $y)
    {
        $village = $this->db->getVillage($user->id);
        if (!$village) {
            return ['error' => 310];
        }

        $building = $this->db->getBuildingType($typeId);
        if (!$building) {
            return ["error" => 301];
        }

        $prohibitedBuidlings = explode(',', PROHIBITED_BUILDINGS);
        for ($i = 0; $i < count($prohibitedBuidlings); $i++) {
            if ($prohibitedBuidlings[$i] === $typeId) {
                return ['error' => 307];
            }
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

    public function upgradeBuilding($buildingId, $user, $typeId)
    {
        $village = $this->db->getVillage($user->id);
        if (!$village) {
            return ['error' => 310];
        }

        $level = $this->db->getLevel($buildingId, $village->id);
        if ($level->level >= MAX_BUILDING_LEVEL) {
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

    public function deleteBuilding($buildingId, $userId)
    {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 310];
        }

        $building = $this->db->getBuilding($buildingId, $village->id);
        if (!$building) {
            return ['error' => 300];
        }

        $prohibitedBuidlings = explode(',', PROHIBITED_BUILDINGS);
        for ($i = 0; $i < count($prohibitedBuidlings); $i++) {
            if ($prohibitedBuidlings[$i] === $building->typeId) {
                return ['error' => 307];
            }
        }

        $result = $this->db->deleteBuilding($buildingId, $village->id);
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

        $filteredUnits = [];
        foreach ($units as &$unit) {
            $unit['onAСrusade'] = (int)$unit['onAСrusade'];
            if ($unit['onAСrusade']) {
                continue;
            }
            $unit['id'] = (int)$unit['id'];
            $unit['typeId'] = (int)$unit['typeId'];
            $unit['villageId'] = (int)$unit['villageId'];
            $unit['x'] = (int)$unit['x'];
            $unit['y'] = (int)$unit['y'];
            $unit['level'] = (int)$unit['level'];
            $unit['speed'] = (float)$unit['speed'];
            $unit['currentHp'] = (int)$unit['currentHp'];

            $filteredUnits[] = $unit;
        }
        $units = $filteredUnits;

        if (count($units) === 0) {
            return [false];
        }

        return $units;
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
        $this->db->buyUnit(
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

    public function deleteUnit($unitId, $userId)
    {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 310];
        }

        $unit = $this->db->getUnit($unitId, $village->id);
        if (!$unit) {
            return ['error' => 500];
        }

        $result = $this->db->deleteUnit($unitId, $village->id);
        if (!$result) {
            return ['error' => 503];
        }

        return true;
    }

    public function getUnitTypes()
    {
        $types = $this->db->getUnitTypes();
        return $types;
    }

    public function moveUnits($userId, $units)
    {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 310];
        }

        $result = $this->db->updateUnitsPosition($units, $village->id);

        if (!$result) {
            return ['error' => 504];
        }

        return true;
    }

    public function sendArmy($user, $units, $target) {
        if (count($units) === 0) {
            return ['error' => 600];
        }

        $startVillage = $this->db->getVillage($user->id);
        if (!$startVillage) {
            return ['error' => 315];
        }

        $targetVillage = $this->db->getVillage($target);
        if (!$targetVillage) {
            return ['error' => 315];
        }

        $crusadeCoast = count($units) * COST_PER_UNIT;

        if ($user->money < $crusadeCoast) {
            return ['error' => 305];
        }

        $newMoney = $user->money - $crusadeCoast;
        $this->db->updateMoney($user->id, $newMoney);

        $unitsSpeed = $this->db->getUnitsSpeed($units);

        $speed = PHP_INT_MAX;
        foreach($unitsSpeed as $unitSpeed) {
            if ($unitSpeed['speed'] < $speed) {
                $speed = $unitSpeed['speed'];
            }
        }

        $startTime = date('Y-m-d H:i:s');
        $distance = sqrt(pow($targetVillage->x - $startVillage->x, 2) + pow($targetVillage->y - $startVillage->y, 2));
        $travelTime = $distance / $speed;
        $arrivalTime = date('Y-m-d H:i:s', time() + $travelTime);

        $army = $this->db->sendArmy(
            $user->id, 
            $startVillage->x, 
            $startVillage->y, 
            $startTime,
            $arrivalTime,
            $targetVillage->x, 
            $targetVillage->y, 
            $target, 
            $units, 
            $speed
        );

        if (!$army) {
            return ['error' => 601];
        }

        $crusade = $this->db->unitsOnACrusade($startVillage->id, $units);
        if (!$crusade) {
            return ['error'];
        }

        return ['newMoney' => $newMoney];
    }

    public function moveArmyBack($userId)
    {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 315];
        }

        $units = $this->db->getUnits($userId);
        $updatedUnits = [];

        $i = 29;
        $j = 1;
        $maxCoordinate = 58; // 29 * 2

        foreach ($units as $unit) {
            $unit["onAСrusade"] = (int)$unit["onAСrusade"];

            if ($unit["onAСrusade"]) {
                $unit["unitId"] = $unit["id"];
                $unit["onAСrusade"] = 0;
                $unit["x"] = $i;
                $unit["y"] = $j;

                // Увеличиваем координаты для следующего юнита
                $i++;
                if ($i > $maxCoordinate) {
                    $i = 29;
                    $j++;
                    if ($j > $maxCoordinate) {
                        return ['error' => 555]; // Превышен лимит позиций
                    }
                }

                $updatedUnits[] = $unit;
            }
        }

        if (empty($updatedUnits)) {
            return true; // Нет юнитов для перемещения
        }

        $result = $this->db->updateUnitsPosition($updatedUnits, $village->id);
        if (!$result) {
            return ['error' => 504];
        }

        $result = $this->db->unitsOffACrusade($updatedUnits, $village->id);
        if (!$result) {
            return ['error' => 504];
        }

        return $updatedUnits;
    }

    public function getUserArmies($userId) {
        $armies = $this->db->getUserArmies($userId);
        if (!$armies) {
            return true;
        }

        $validArmies = [];
        $currentTime = time();

        foreach($armies as $army) {
            $arrivalTime = strtotime($army['arrivalTime']);

            if ($arrivalTime > $currentTime) {
                $validArmies[] = [
                    'armyId' => (int)$army['armyId'],
                    'units' => $army['units'],
                    'enemyName' => $army['enemyName'],
                    'attackId' => (int)$army['attackId'],
                    'speed' => (float)$army['speed']
                ];
            }
        }

        if (!$validArmies) {
            return true;
        }

        return $validArmies;
    }
}
