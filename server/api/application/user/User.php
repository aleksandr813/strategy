<?php

class User
{
    private $db;
    function __construct($db)
    {
        $this->db = $db;
    }

    public function getUser($token)
    {
        return $this->db->getUserByToken($token);
    }

    public function login($login, $hash, $rnd)
    {
        $user = $this->db->getUserByLogin($login);
        if ($user) {
            if (md5($user->password . $rnd) === $hash) {
                $token = md5(rand());
                $this->db->updateToken($user->id, $token);
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'token' => $token
                ];
            }
            return ['error' => 1002];
        }
        return ['error' => 1005];
    }

    public function logout($token)
    {
        $user = $this->db->getUserByToken($token);
        if ($user) {
            $this->db->updateToken($user->id, null);
            return true;
        }
        return ['error' => 1003];
    }

    public function registration($login, $hash, $name)
    {
        // Валидация логина
        $loginValidation = $this->validateLogin($login);
        if ($loginValidation !== true) {
            return $loginValidation;
        }

        // Проверка уникальности логина
        if ($this->db->getUserByLogin($login)) {
            return ['error' => 1001];
        }

        // Регистрация пользователя
        $this->db->registration($login, $hash, $name);
        $user = $this->db->getUserByLogin($login);

        if ($user) {
            // Создание стартовой деревни для пользователя
            $villageCreated = $this->createStarterVillage($user->id);
            if (!$villageCreated) {
                return ['error' => 1006];
            }

            $token = md5(rand());
            $this->db->updateToken($user->id, $token);
            return [
                'id' => $user->id,
                'name' => $user->name,
                'token' => $token
            ];
        }
        return ['error' => 1004];
    }

    private function createStarterVillage($userId){
        // Генерация случайных координат для деревни
        $x = rand(1, 1000);
        $y = rand(1, 1000);

        // Создание деревни в базе данных
        $result = $this->db->createVillage($userId, $x, $y);
        if (!$result) {
            return false;
        }

        // Получаем ID созданной деревни
        $village = $this->db->getVillageByUserId($userId);

        // Создание стартовых построек
        $this->createStarterBuildings($village->id);

        return true;
    }

    private function createStarterBuildings($villageId)
    {
        // Создание основных стартовых построек
        $starterBuildings = [
            ['type_id' => 1, 'x' => 15, 'y' => 15], // Ратуша
            ['type_id' => 2, 'x' => 5, 'y' => 5], // Шахта
        ];

        foreach ($starterBuildings as $building) {
            $this->db->createBuilding(
                $villageId,
                $building['type_id'],
                $building['x'],
                $building['y']
            );
        }
    }

    //Валидация логина

    private function validateLogin($login)
    {
        // Проверка длины
        if (strlen($login) < 5 || strlen($login) > 20) {
            return ['error' => 1007];
        }

        // Проверка на начало с цифры или подчеркивания
        if (preg_match('/^[0-9_]/', $login)) {
            return ['error' => 1008];
        }

        // Проверка допустимых символов
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $login)) {
            return ['error' => 1009];
        }

        // Проверка на пробелы и специальные символы
        if (preg_match('/[\s@#$%]/', $login)) {
            return ['error' => 1010];
        }

        return true;
    }
}
