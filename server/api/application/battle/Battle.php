<?php

class Battle {
    private $db;
    private $config;
    private $village;

    public function __construct($db)
    {
        $this->db = $db;
        $this->config = require('config.php');
        $this->village = new Village($db);
    }

    public function takeDamage($attackerId, $targetId, $battleId) {
        $attackerObject = $this->db->getBattleObject($attackerId, $battleId);
        if (!$attackerObject) {
            return;
        }

        if ($attackerObject->isAlive == 0) {
            return;
        }

        $currentTime = time();
        $lastAttackTime = strtotime($attackerObject->lastAttackTime);
        $objectType = null;

        if ($attackerObject->objectType == 'UNIT') {
            $objectType = $this->db->getUnitStats($attackerObject->typeId);
            
        } else {
            $objectType = $this->db->getBuildingStatsForLevel($attackerObject->typeId, $attackerObject->level);
        }

        $attackSpeed = (int)$objectType->attackSpeed;
        $damage = (int)$objectType->damage;

        $timeSinceLastAttack = $currentTime - $lastAttackTime;
        if ($timeSinceLastAttack < $attackSpeed) {
            return;
        }

        $this->db->updateBattleObjectLastAttackTime($attackerId, date('Y-m-d H:i:s'));

        $targetObject = $this->db->getBattleObject($targetId, $battleId);
        if (!$targetObject) {
            return;
        }

        $newHp = max(0, $targetObject->currentHp - $damage);
        $this->db->updateBattleObjectHp($targetId, $newHp);

        if ($newHp == 0) {
            $this->db->markObjectBattleNotAlive($battleId, $targetId);

            if ($targetObject->objectType == 'BUILDING') {
                $this->db->updateBattleObjectType($targetId, 'RUIN');
            }
            elseif ($targetObject->objectType == 'UNIT') {
                $this->db->updateBattleObjectType($targetId, 'CORPSE');
            }
        }
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

    public function getBattle($userId, $hash, $id) {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 310];
        }

        $battle = $this->db->getActiveBattle($id, $village->id);
        if (!$battle) {
            return true;
        }

        $isAttacker = $battle->attackerVillageId == $village->id;
        $this->updateOnlineStatus($battle, $isAttacker);

        $enemyOnline = $this->isEnemyOnline($battle, $isAttacker);

        $objects = $this->db->getBattleObjects($battle->id);

        $alliedUnits = [];
        $enemyUnits = [];
        $buildings = [];
        $corpse = [];
        $ruin = [];

        foreach($objects as $object) {
            $objectData = [
                'id' => $object['id'],
                'typeId' => $object['typeId'],
                'objectType' => $object['objectType'],
                'x' => $object['x'],
                'y' => $object['y'],
                'currentHp' => $object['currentHp'],
                'ownerVillageId' => $object['ownerVillageId']
            ];

            $isAllied = ($isAttacker && $object['ownerVillageId'] == $battle->attackerVillageId ||
            !$isAttacker && $object['ownerVillageId'] == $battle->defenderVillageId);

            switch($object['objectType']) {
                case 'UNIT':
                    $unitStats = $this->db->getUnitStats($object['typeId']);
                    if ($unitStats) {
                        $objectData['speed'] = $unitStats->speed;
                        $objectData['rangeAttack'] = $unitStats->rangeAttack;
                        $objectData['attackSpeed'] = $unitStats->attackSpeed;
                        $objectData['damage'] = $unitStats->damage;
                    }

                    if ($isAllied) {
                        $alliedUnits[] = $objectData;
                    } else {
                        $enemyUnits[] = $objectData;
                    }
                    break;
                case 'BUILDING':
                    $buildingStats = $this->db->getBuildingStatsForLevel($object['typeId'], $object['level']);
                    if ($buildingStats) {
                        $objectData['rangeAttack'] = $buildingStats->rangeAttack;
                        $objectData['attackSpeed'] = $buildingStats->attackSpeed;
                        $objectData['damage'] = $buildingStats->damage;
                    }

                    if (!$isAttacker) {
                        $buildings[] = $objectData;
                    }
                    break;
                case 'CORPSE':
                    $corpse[] = $objectData;
                    break;

                case 'RUIN':
                    $ruin = $objectData;
                    break;
            }
        }

        $battleData = [
            'battleId' => $battle->id,
            'alliedUnits' => $alliedUnits,
            'enemyUnits' => $enemyUnits,
            'buildings' => $buildings,
            'corpse' => $corpse,
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
    
    public function updateBattle($userId, $battleId, $unitsString, $damageToUnits, $damageToBuildings) {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 310];
        }

        $units = $this->village->parseUnitsString($unitsString);
        if (!$units) {
            return ['error' => 504];
        }

        $updatedPositionUnits = $this->db->updateUnitsPositionInBattle($battleId, $units, $village->id);

        if (!$updatedPositionUnits) {
            return ['error' => 504];
        }

        if ($damageToUnits) {
            foreach($damageToUnits as $attackerId => $targetId) {
                $this->takeDamage($attackerId, $targetId, $battleId);
            }
        }

        if ($damageToBuildings) {
            foreach($damageToBuildings as $attackerId => $targetId) {
                $this->takeDamage($attackerId, $targetId, $battleId);
            }
        }

        return true;
    }
}