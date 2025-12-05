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
        }
        
        return $result;
    }
}