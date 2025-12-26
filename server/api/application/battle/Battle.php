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

    public function getBattle($userId, $hash) {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 310];
        }

        $battle = $this->db->getActiveBattle($village->id);
        if (!$battle) {
            return true;
        }

        $isAttacker = $battle->attackerVillageId == $village->id;
        $this->updateOnlineStatus($battle, $isAttacker);

        $enemyOnline = $this->isEnemyOnline($battle, $isAttacker);

        $objects = $this->db->getBattleObjects($battle->id);

        $units = [];
        $buildings = [];
        $corpse = [];
        $ruin = [];

        foreach($objects as $object) {
            switch($object['objectType']) {
                case 'UNIT':
                    $units[] = $object;
                    break;
                case 'BUILDING':
                    $buildings[] = $object;
                    break;
                case 'CORSPE':
                    $corpse[] = $object;
                    break;
                case 'RUIN':
                    $ruin = $object;
                    break;
            }
        }

        $battleData = [
            'battleId' => $battle->id,
            'units' => $units,
            'buildings' => $buildings,
            'corspe' => $corpse,
            'ruin' => $ruin,
            'enemyOnline' => $enemyOnline,
            'isAttacker' => $isAttacker
        ];

        $currentHash = md5(json_encode($battleData));

        if ($currentHash === $hash) {
            return ['hash' => $hash];
        }

        if ($battle->hash !== $currentHash) {
            $this->db->updateBattleHash($battle->id, $currentHash);
        }

        return [
            'hash' => $currentHash,
            'battleData' => $battleData
        ];
    }

    private function updateOnlineStatus($battle, $isAttacker) {
        $now = date('Y-m-d H:i:s');

        if ($isAttacker) {
            return $this->db->updateAttackerStatus($battle->id, $now);
        } else {
            return $this->db->updateDefenderStatus($battle->id, $now);
        }
    }

    private function isEnemyOnline($battle, $isAttacker) {
        $now = time();

        $lastOnlineStr = $isAttacker ? $battle->defenderLastOnline : $battle->attackerLastOnline;

        $lastOnline = strtotime($lastOnlineStr);
        $timeDiff = $now - $lastOnline;

        return $timeDiff <= ONLINE_TIMEOUT;
    }
}