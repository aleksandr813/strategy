<?php

class Map {
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getMap($hash) {
        $villages = $this->db->getVillages();
        $armies = $this->db->getArmies();

        $movingArmies = $this->calculateArmyPosition($armies);

        $mapData = [
            'villages' => $villages,
            'armies' => $movingArmies
        ];

        $currentHash = md5(json_encode($mapData));
        $storedHash = $this->db->getMapHash();

        if ($currentHash === $hash) {
            return ['hash' => $hash];
        }

        if ($storedHash->hash !== $currentHash) {
            $this->db->updateMapHash($currentHash);
        }

        return [
            'hash' => $currentHash,
            'mapData' => $mapData
        ];
    }

    private function calculateArmyPosition($armies) {
        $result = [];
        $currentTime = time();

        foreach($armies as $army) {
            $startTime = strtotime($army['startTime']);
            $arrivalTime = strtotime($army['arrivalTime']);

            $totalTime = $arrivalTime - $startTime;
            $timeSpent = $currentTime - $startTime;
            $progress = min(1, max(0, $timeSpent / $totalTime));

            $currentX = $army['startX'] + ($army['targetX'] - $army['startX']) * $progress;
            $currentY = $army['startY'] + ($army['targetY'] - $army['startY']) * $progress;

            $result[] = [
                'id' => (int) $army['army'],
                'userId' => (int) $army['userId'],
                'currentX' => round($currentX),
                'currentY' => round($currentY),
                'startTime' => $army['startTime'],
                'arrivalTime' => max(0, $arrivalTime - $currentTime),
                'targetX' => (int) $army['targetX'],
                'targetY' => (int) $army['targetY'],
                'attackId' => (int) $army['attackId'],
                'units' => $army['units'],
                'speed' => (float) $army['speed']
            ];

            if ($progress == 1) {
                $this->startBattle((int)$army['army']);
                $this->db->deleteArmyById($army['army']);
            }
        }
        
        return $result;
    }

    private function startBattle($armyId) {
        $army = $this->db->getArmy($armyId);
        if (!$army) {
            return ['error' => 603];
        }

        $defenderVillage = $this->db->getVillage($army->attackId);
        if (!$defenderVillage) {
            return ['error' => 315];
        }

        $attackerVillage = $this->db->getVillage($army->userId);
        if (!$attackerVillage) {
            return ['error' => 315];
        }

        $defenderdUnits = $this->db->getUnits($defenderVillage->id);
        $attackerUnits = $this->db->getUnitsInArmy($armyId);

        $defenderBuildings = $this->db->getBuildings($defenderVillage->id);

        $now = date('Y-m-d H:m:s');
        $battleId = $this->db->startBattle($attackerVillage->id, $defenderVillage->id, $now, $now, md5(rand()));

        $this->db->addObjectsToBattle($defenderdUnits, 'UNIT', $battleId);
        $this->db->addObjectsToBattle($attackerUnits, 'UNIT', $battleId);

        $this->db->addObjectsToBattle($defenderBuildings, 'BUILDING', $battleId);

        $this->db->markVillageAttack($defenderVillage->id);
    }
}