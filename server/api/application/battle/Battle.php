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
}