<?php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

error_reporting(1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once('application/Answer.php');
require_once('application/Application.php');

function result($params) {
    $method = $params['method'];
    if ($method) {
        $app = new Application();
        switch ($method) {
            // user
            case 'login': return $app->login($params);
            case 'logout': return $app->logout($params);
            case 'registration': return $app->registration($params);
            // chat
            case 'sendMessage': return $app->sendMessage($params);
            case 'getMessages': return $app->getMessages($params); //loop
            //village
            case 'getUnitTypes': return $app->getUnitTypes($params);
            case 'getUnits': return $app->getUnits($params);
            case 'buyUnit': return $app->buyUnit($params);
            case 'moveUnits': return $app->moveUnits($params);
            case 'deleteUnit': return $app->deleteUnit($params);
            case 'getBuildingTypes': return $app->getBuildingTypes($params);
            case 'getBuildings': return $app->getBuildings($params);
            case 'buyBuilding': return $app->buyBuilding($params);
            case 'upgradeBuilding': return $app->upgradeBuilding($params);
            case 'deleteBuilding': return $app->deleteBuilding($params);
            case 'getIncome': return $app->getIncome($params); //loop
            case 'sendArmy': return $app->sendArmy($params);
            case 'moveArmyBack': return $app->moveArmyBack($params);
            case 'getUserArmies': return $app->getUserArmies($params);
            //map
            case 'getMap': return $app->getMap($params); //loop
            //battle
            case 'takeDamage': return $app->takeDamage($params);
            case 'unitsAttackDistance': return $app->unitsAttackDistance($params); //loop
            case 'getBattle': return $app->getBattle($params); //loop
            //calc
            case 'getRoots': return $app->getRoots($params);

            default: return ['error' => 102];
        }
    }
    return ['error' => 101];
}

echo json_encode(Answer::response(result($_GET)), JSON_UNESCAPED_UNICODE);
