<?php

class Battle {
    private $db;
    private $config;

    public function __construct($db)
    {
        $this->db = $db;
        $this->config = require('config.php');
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

        if ($diffSeconds < $this->config['game']['income']['interval']) {
            return [
                'money' => $this->db->getMoney($userId)->money
            ];
        }

        $currentMoney = $this->db->getMoney($userId);
        $income = $mine->level * $this->config['game']['income']['incomePerLevel'];
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

        foreach($buildings as &$building) {
            $building['id'] = (int)$building['id'];
            $building['typeId'] = (int)$building['typeId'];
            $building['villageId'] = (int)$building['villageId'];
            $building['x'] = (int)$building['x'];
            $building['y'] = (int)$building['y'];
            $building['level'] = (int)$building['level'];
            $building['currentHp'] = (int)$building['currentHp'];
        }

        if (count($buildings) === 0) {
            return [ false ];
        }

        return $buildings;
    }

    public function getBuildingTypes() {
        $types = $this->db->getBuildingTypes();
        return $types;
    }

    public function deleteBuilding($buildingId, $userId) {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 310];
        }

        $building = $this->db->getBuilding($buildingId, $village->id);
        if (!$building) {
            return ['error' => 300];
        }

        for ($i = 0; $i < count($this->config['game']['prohibitedBuildings']); $i++) {
            if ($this->config['game']['prohibitedBuildings'][$i] === $building->typeId) {
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

        foreach($units as &$unit) {
            $unit['id'] = (int)$unit['id'];
            $unit['typeId'] = (int)$unit['typeId'];
            $unit['villageId'] = (int)$unit['villageId'];
            $unit['x'] = (int)$unit['x'];
            $unit['y'] = (int)$unit['y'];
            $unit['level'] = (int)$unit['level'];
            $unit['currentHp'] = (int)$unit['currentHp'];
        }

        if (count($units) === 0) {
            return [ false ];
        }

        return $units;
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

    public function moveUnits($userId, $units) {
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


    public function takeDamage($userId, $units) {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 315];
        }

        $result = $this->db->updateUnitsHP($units, $village->id);

        if (!$result) {
            return ['error' => 510];
        }

        return true;
    }
}