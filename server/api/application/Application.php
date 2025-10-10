<?php
require_once ('db/DB.php');
require_once ('user/User.php');
require_once ('chat/Chat.php');
require_once ('unit/Unit.php');
require_once ('building/Building.php');
require_once ('economy/Economy.php');

class Application {
    function __construct() {
        $db = new DB();
        $this->user = new User($db);
        $this->chat = new Chat($db);
        $this->unit = new Unit($db);
        $this->building = new Building($db);
         $this->economy = new Economy($db);
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

    public function getBuildingTypes($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->building->getBuildingTypes();
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function createBuilding($params) {
        if ($params['token'] && $params['building_type'] && isset($params['x']) && isset($params['y'])) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->building->createBuilding($user->id, $params['building_type'], $params['x'], $params['y']);
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

     public function getEconomyState($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->economy->getEconomyState($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getIncomeSources($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->economy->getIncomeSources($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function addGold($params) {
        if ($params['token'] && $params['amount']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                $result = $this->economy->addGold($user->id, $params['amount']);
                return $result ? ['success' => true] : ['error' => 'Failed to add gold'];
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }
    
    public function getMineIncome($params) {
    if ($params['token'] && $params['mine_id']) {
        $user = $this->user->getUser($params['token']);
        if ($user) {
            return $this->economy->getIncome($params['mine_id'], $user->id);
        }
        return ['error' => 705];
    }
    return ['error' => 242];
}

public function getAllMinesIncome($params) {
    if ($params['token']) {
        $user = $this->user->getUser($params['token']);
        if ($user) {
            return $this->economy->getAllMinesIncome($user->id);
        }
        return ['error' => 705];
    }
    return ['error' => 242];
}

public function updateMineIncomeTime($params) {
    if ($params['token'] && $params['mine_id'] && $params['income_time']) {
        $user = $this->user->getUser($params['token']);
        if ($user) {
            return $this->economy->updateMineIncomeTime($params['mine_id'], $user->id, $params['income_time']);
        }
        return ['error' => 705];
    }
    return ['error' => 242];
}
    
        
    
    
}
