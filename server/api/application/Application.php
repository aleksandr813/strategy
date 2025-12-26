<?php
require_once('db/DB.php');
require_once('user/User.php');
require_once('chat/Chat.php');
require_once('calculator/Calculator.php');
require_once('village/Village.php');
require_once('battle/Battle.php');
require_once('map/Map.php');

class Application
{
    private $user;
    private $chat;
    private $village;
    private $battle;
    private $map;

    private $calculator;

    function __construct()
    {
        $db = new DB();
        $this->user = new User($db);
        $this->chat = new Chat($db);
        $this->calculator = new Calculator();
        $this->village = new Village($db);
        $this->battle = new Battle($db);
        $this->map = new Map($db);
    }

    public function login($params)
    {
        // Проверка на пустые поля
        if (empty($params['login']) || empty($params['hash']) || empty($params['rnd'])) {
            return ['error' => 1016];
        }

        return $this->user->login($params['login'], $params['hash'], $params['rnd']);
    }


    public function registration($params)
    {
        // Проверка на пустые поля
        if (empty($params['login']) || empty($params['hash']) || empty($params['name'])) {
            return ['error' => 1016];
        }

        return $this->user->registration($params['login'], $params['hash'], $params['name']);
    }

    public function logout($params)
    {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->user->logout($params['token']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }



    public function sendMessage($params)
    {
        if ($params['token'] && $params['message']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->chat->sendMessage($user->id, $params['message']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getMessages($params)
    {
        if ($params['token'] && $params['hash']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->chat->getMessages($params['hash']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getUnits($params)
    {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->getUnits($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function buyUnit($params)
    {
        if ($params['token'] && $params['typeId'] && isset($params['x']) && isset($params['y'])) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->buyUnit($user, $params['typeId'], $params['x'], $params['y']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function deleteUnit($params)
    {
        if ($params['token'] && $params['id']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->deleteUnit($params['id'], $user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getBuildings($params)
    {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->getBuildings($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getBuildingTypes($params)
    {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->getBuildingTypes();
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getUnitTypes($params)
    {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->getUnitTypes();
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function moveUnits($params)
    {
        if ($params['token']  && $params['units']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->moveUnits($user->id, $params['units']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function takeDamage($params)
    {
        if ($params['token']  && $params['units']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->battle->takeDamage($user->id, $params['units']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }


    public function buyBuilding($params)
    {
        if ($params['token'] && $params['typeId'] && $params['x'] && $params['y']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->buyBuilding($user, $params['typeId'], $params['x'], $params['y']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function upgradeBuilding($params)
    {
        if ($params['token'] && $params['id'] && $params['typeId']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->upgradeBuilding($params['id'], $user, $params['typeId']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function deleteBuilding($params)
    {
        if ($params['token'] && $params['id']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->deleteBuilding($params['id'], $user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getRoots($params)
    {
        if ($params) {
            $result = $this->calculator->get($params);
            return $result;
        }
        return ['error' => 242];
    }

    public function getIncome($params)
    {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->getIncome($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function sendArmy($params)
    {
        if ($params['token'] && $params['target'] && $params['units']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->sendArmy($user, $params['units'], $params['target']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getMap($params) {
        if ($params['token'] && $params['hash']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->map->getMap($params['hash']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function moveArmyBack($params)
    {
        if ($params['token'] && $params['armyId']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->moveArmyBack($user->id, $params['armyId']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getUserArmies($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->village->getUserArmies($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function unitsAttackDistance($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->battle->unitsAttackDistance($user->id);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getBattle($params) {
        if ($params['token'] && $params['hash']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->battle->getBattle($user->id, $params['hash']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }
}
