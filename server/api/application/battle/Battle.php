<?php

class Battle {
    private $db;
    private $config;

    public function __construct($db)
    {
        $this->db = $db;
        $this->config = require('config.php');
    }

    public function takeDamage($userId, $attackerId, $targetId, $battleId, $isUnit) {
        $village = $this->db->getVillage($userId);
        if (!$village) {
            return ['error' => 315];
        }

        $battle = $this->db->getActiveBattle($battleId, $village->id);
        if (!$battle) {
            return true;
        }

        if ($isUnit) {
            $attacker = $this->db->getUnit($attackerId, $battle->attackerVillageId);
            if (!$attacker) {
                $attacker = $this->db->getUnit($attackerId, $battle->defenderVillageId);
                if (!$attacker) {
                    return ['error' => 500];
                }
            }

            $currentTime = time();
            $lastAttackTime = strtotime($attacker['lastAttackTime']);
            $attackSpeed = (int)$attacker['attackSpeed'];
            $timeSinceLastAttack = $currentTime - $lastAttackTime;

            if ($timeSinceLastAttack < $attackSpeed) {
                return true;
            }

            $damage = (int)$attacker['damage'];
        } else {
            $attacker = $this->db->getBuilding($attackerId, $battle->defenderVillageId);
            if (!$attacker) {
                return ['error' => 300];
            }

            $attackerStats = $this->db->getBuildingForStats($attacker['typeId'], $attacker['level']);
            
            $currentTime = time();
            $lastAttackTime = strtotime($attacker['lastAttackTime']);
            $attackSpeed = (int)$attackerStats['attackSpeed'];
            $timeSinceLastAttack = $currentTime - $lastAttackTime;

            if ($timeSinceLastAttack < $attackSpeed) {
                return true;
            }

            $damage = (int)$attackerStats['damage'];
        }

        if ($isUnit) {
            $target = $this->db->getUnit($targetId, $battle->defenderVillageId);
            if (!$target) {
                $target = $this->db->getUnit($targetId, $battle->attackerVIllageId);
                if (!$attacker) {
                    return ['error' => 500];
                }
            }

            $targetIsUnit = true;
        } else {
            $target = $this->db->getBuilding($targetId, $battle->defenderVillageId);
            if (!$target) {
                return ['error' => 300];
            }

            $targetIsUnit = false;
        }

        $newHp = max(0, (int)$target['currentHp'] - $damage);

        if ($targetIsUnit) {
            $this->db->updateUnitHp($targetId, $newHp);

            if ($newHp == 0) {
                $this->db->markObjectBattleAsDead($battleId, $targetId);
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

        $defenderUnits = $this->db->getUnits($battle->defenderVillageId);
        $attackerUnits = $this->db->getUnitsInArmy($battle->armyAttackId);

        $buildings = $this->db->getBuildings($battle->defenderVillageId);
        $corpse = [];
        $ruin = [];

        foreach($objects as $object) {
            $objectWithoutType = $object;
            unset($objectWithoutType['objectType']);

            switch($object['objectType']) {
                case 'CORPSE':
                    $corpse[] = $objectWithoutType;
                    break;

                case 'RUIN':
                    $ruin = $objectWithoutType;
                    break;
            }
        }

        if ($isAttacker) {
            $alliedUnits = $attackerUnits;
            $enemyUnits = $defenderUnits;
        } else {
            $alliedUnits = $defenderUnits;
            $enemyUnits = $attackerUnits;
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
}