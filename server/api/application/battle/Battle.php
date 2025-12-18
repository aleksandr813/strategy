<?php

class Battle {
    private $db;
    private $config;

    public function __construct($db)
    {
        $this->db = $db;
        $this->config = require('config.php');
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

    public function unitsAttackDistance($userId) {
        $alliedVillage = $this->db->getVillage($userId);
        if (!$alliedVillage) {
            return ['error' => 315];
        }

        $enemyVillage = $alliedVillage->attackId;

        $alliedUnits = $this->db->getUnits($alliedVillage->id);
        $enemyUnits = $this->db->getUnits($enemyVillage);

        $result = [];

        foreach($alliedUnits as $alliedUnit) {
            if ($alliedUnit['onACrusade'] || $alliedUnit['currentHp'] <= 0) {
                continue;
            }

            $attackRange = (int)$alliedUnit['rangeAttack'];
            
            $minDistance = PHP_INT_MAX;
            $nearestEnemyUnit = null;

            foreach($enemyUnits as $enemyUnit) {
                if ($enemyUnit['onACrusade'] || $enemyUnit['currentHp'] <= 0) {
                    continue;
                }

                $distance = $this->culculateDistance($alliedUnit['x'], $alliedUnit['y'], $enemyUnit['x'], $enemyUnit['y']);

                if ($distance < $attackRange && $distance < $minDistance) {
                    $nearestEnemyUnit = $enemyUnit['id'];
                    $minDistance = $distance;
                }
            }

            $result[] = [
                'attackerId' => $alliedUnit['id'],
                'nearestEnemyUnit' => $nearestEnemyUnit
            ];
        }

        return $result;
    }

    private function culculateDistance($x1, $y1, $x2, $y2) {
        return sqrt(pow($x2 - $x1, 2) + pow($y2 - $y1, 2));
    }
}