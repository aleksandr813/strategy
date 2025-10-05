<?php
require_once ('db/DB.php');
require_once ('user/User.php');
require_once ('chat/Chat.php');
require_once ('unit/Unit.php');
require_once ('building/Building.php');

class Application {
    function __construct() {
        $db = new DB();
        $this->user = new User($db);
        $this->chat = new Chat($db);
        $this->unit = new Unit($db);
        $this->building = new Building($db);
    }

    public function login($params) {
        if ($params['login'] && $params['hash'] && $params['rnd']) {
            return $this->user->login($params['login'], $params['hash'], $params['rnd']);
        }
        return ['error' => 242];
    }

    public function logout($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->user->logout($params['token']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function registration($params) {
        if ($params['login'] && $params['password'] && $params['name']) {
            return $this->user->registration($params['login'], $params['password'], $params['name']);
        }
        return ['error' => 242];
    }

    public function sendMessage($params) {
        if ($params['token'] && $params['message']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->chat->sendMessage($user->id, $params['message']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getMessages($params) {
        if ($params['token'] && $params['hash']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->chat->getMessages($params['hash']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getUnitById($params) {
        if ($params['token'] && $params['id']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->unit->getUnitById($params['id']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getUnitsByUser($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->unit->getUnitsByUser($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function createUnit($params) {
        if ($params['token'] && $params['unit_type'] && isset($params['x']) && isset($params['y'])) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->unit->createUnit($user->id, $params['unit_type'], $params['x'], $params['y']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function updateUnit($params) {
        if ($params['token'] && $params['id'] && $params['unit_type'] && isset($params['x']) && isset($params['y'])) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->unit->updateUnit($params['id'], $user->id, $params['unit_type'], $params['x'], $params['y']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function deleteUnit($params) {
        if ($params['token'] && $params['id']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->unit->deleteUnit($params['id'], $user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getBuildingById($params) {
        if ($params['token'] && $params['id']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->building->getBuildingById($params['id']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getBuildingsByUser($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->building->getBuildingsByUser($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function buyBuilding($params) {
        if ($params['token'] && $params['type_id'] && $params['village_id'] && isset($params['x']) && isset($params['y'])) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->building->buyBuilding($user->id, $params['type_id'], $params['village_id'], $params['x'], $params['y']);
            }
            return ['error' => 705];
        }   
        return ['error' => 242];
    }

    public function updateBuilding($params) {
        if ($params['token'] && $params['id'] && $params['building_type'] && $params['x'] && $params['y']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->building->updateBuilding($params['id'], $user->id, $params['building_type'], $params['x'], $params['y']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function deleteBuilding($params) {
        if ($params['token'] && $params['id']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->building->deleteBuilding($params['id'], $user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }
}