<?php

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
            case 'getMessages': return $app->getMessages($params);
            //unit
            case 'getUnitById': return $app->getUnitById($params);
            case 'getUnitsByUser': return $app->getUnitsByUser($params);
            case 'createUnit': return $app->createUnit($params);
            case 'updateUnit': return $app->updateUnit($params);
            case 'deleteUnit': return $app->deleteUnit($params);
            //building
            case 'getBuilding': return $app->getBuildingById($params);
            case 'getBuildings': return $app->getBuildings($params);
            case 'createBuilding': return $app->createBuilding($params);
            case 'updateBuilding': return $app->updateBuilding($params);
            case 'deleteBuilding': return $app->deleteBuilding($params);
            default: return ['error' => 102];
        }
    }
    return ['error' => 101];
}

echo json_encode(Answer::response(result($_GET)), JSON_UNESCAPED_UNICODE);
