<?php
require_once ('db/DB.php');
require_once ('user/User.php');
require_once ('chat/Chat.php');
require_once ('service/MatrixService.php');
require_once ('calculator/Calculator.php');

class Application {
    private $user;
    private $chat;
    private $matrixService;

    function __construct() {
        $db = new DB();
        $this->user = new User($db);
        $this->chat = new Chat($db);
        $this->matrixService = new MatrixService();
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

    public function getBooleanMap($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                $result = $this->matrixService->convertToBooleanMatrix($params['matrix']);
                 return $result;
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getObjectMatrix($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                $result = $this->matrixService->convertToObjectMatrix($params['matrix']);
                return $result;
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getRoots($params) {
        if ($params) {
            
        }
    }
}