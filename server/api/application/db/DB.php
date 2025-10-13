<?php

class DB
{
    private $pdo;

    function __construct()
    {
        // MySQL
        $host = '127.0.0.1';
        $port = '3306';
        $user = 'root';
        $pass = 'root';
        $db = 'strategy';
        $connect = "mysql:host=$host;port=$port;dbname=$db;charset=utf8";
        //$this->pdo = new PDO($connect, $user, $pass);
        // Postgres
        // $host = 'localhost';
        // $port = '5432';
        // $user = 'postgres';
        // $pass = '---';
        // $db = 'nopainnogame';
        // $connect = "pgsql:host=$host;port=$port;dbname=$db;";
        $this->pdo = new PDO($connect, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }

    public function __destruct()
    {
        $this->pdo = null;
    }

    // выполнить запрос без возвращения данных
    private function execute($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        return $sth->execute($params);
    }

    // получение ОДНОЙ записи
    private function query($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetch(PDO::FETCH_OBJ);
    }

    // получение НЕСКОЛЬКИХ записей
    private function queryAll($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserByLogin($login)
    {
        return $this->query("SELECT * FROM users WHERE login=?", [$login]);
    }

    public function getUserByToken($token)
    {
        return $this->query("SELECT * FROM users WHERE token=?", [$token]);
    }

    public function updateToken($userId, $token)
    {
        $this->execute("UPDATE users SET token=? WHERE id=?", [$token, $userId]);
    }

    public function registration($login, $password, $name)
    {
        $hash = md5($login . $password); // Создаем MD5-хеш от логина и пароля
        $this->execute("INSERT INTO users (login, password, name) VALUES (?, ?, ?)", [$login, $hash, $name]);
    }

    public function getChatHash()
    {
        return $this->query("SELECT * FROM hashes WHERE id=1");
    }

    public function updateChatHash($hash)
    {
        $this->execute("UPDATE hashes SET chat_hash=? WHERE id=1", [$hash]);
    }

    public function addMessage($userId, $message)
    {
        $this->execute('INSERT INTO messages (user_id, message, created) VALUES (?,?, now())', [$userId, $message]);
    }

    public function getMessages()
    {
        return $this->queryAll(
            "SELECT u.name AS author, m.message AS message,
                                DATE_FORMAT(m.created, '%Y-%m-%d %H:%i:%s') AS created 
                                FROM messages as m 
                                LEFT JOIN users as u on u.id = m.user_id 
                                ORDER BY m.created DESC"
        );
    }

    public function getUnitById($unitId)
    {
        return $this->query(
            "SELECT u.*
            FROM units AS u
            JOIN users ON u.user_id = users.id
            WHERE u.id = ?
        ",
            [$unitId]
        );
    }

    public function getUnitsByUser($userId)
    {
        return $this->queryAll(
            "SELECT * FROM units
            WHERE user_id = ?
            ORDER BY unit_type
        ",
            [$userId]
        );
    }

    public function createUnit($userId, $unitType, $x, $y)
    {
        return $this->execute(
            "INSERT INTO units (user_id, unit_type, x, y) VALUES (?, ?, ?, ?)",
            [$userId, $unitType, $x, $y]
        );
    }

    public function updateUnit($unitId, $userId, $unitType, $x, $y)
    {
        return $this->execute(
            "UPDATE units SET unit_type = ?, x = ?, y = ? WHERE id = ? AND user_id = ?",
            [$unitType, $x, $y, $unitId, $userId]
        );
    }

    public function deleteUnit($unitId, $userId)
    {
        return $this->execute("DELETE FROM units WHERE id = ? AND user_id = ?", [$unitId, $userId]);
    }

    public function getBuildingById($buildingId)
    {
        return $this->query(
            "SELECT b.*
            FROM buildings AS b
            JOIN users AS u ON b.user_id = u.id
            WHERE b.id = ?",
            [$buildingId]
        );
    }

    public function getBuildings($userId)
    {
        return $this->queryAll(
            "SELECT id, type_id, village_id, x, y, level, current_hp FROM buildings
            WHERE village_id = (SELECT id FROM villages WHERE user_id = ?)
            ORDER BY type_id
        ",
            [$userId]
        );
    }

    public function createBuilding($villageId, $buildingType, $x, $y)
    { 
        return $this->execute(
            "INSERT INTO buildings (village_id, type_id, x, y, level, current_hp) VALUES (?, ?, ?, ?, 1, 100)",
            [$villageId, $buildingType, $x, $y]
        );
    }
    public function buyBuilding($villageId, $buildingId, $x, $y, $hp) {
        $this->execute("INSERT INTO buildings
            (type_id, village_id, x, y, current_hp) VALUES (?, ?, ?, ?, ?)", 
            [$buildingId, $villageId, $x, $y, $hp]
        );
    }

    public function getVillageByUserId($userId) {
        return $this->query("SELECT id, user_id, x, y FROM villages WHERE user_id = ?", [$userId]);
    }

    public function getBuildingType($buildingType) {
        return $this->query("SELECT hp, price FROM building_types WHERE id = ?", [$buildingType]);
    }

    public function getUnitType($unitType) {
        return $this->query("SELECT hp, price FROM unit_types WHERE id = ?", [$unitType]);
    }

    public function getPositionBuilding($villageId, $x, $y) {
        return $this->query(
            "SELECT village_id, x, y 
            FROM buildings 
            WHERE village_id = ? AND x = ? AND y = ?",
            [$villageId, $x, $y]
        );
    }

    public function getMoney($userId) {
        return $this->query("SELECT money FROM users WHERE id = ?", [$userId]);
    }

    public function updateMoney($userId, $money) {
        return $this->execute("UPDATE users SET money = ? WHERE id = ?", [$money, $userId]);
    }

    public function updateBuilding($buildingId, $userId, $buildingType, $x, $y) {
        return $this->execute("UPDATE buildings SET building_type = ?, x = ?, y = ? WHERE id = ? AND user_id = ?",
            [$buildingType, $x, $y, $buildingId, $userId]
        );
    }

    public function deleteBuilding($buildingId, $userId)
    {
        return $this->execute(
            "
            DELETE FROM buildings 
            WHERE id = ? 
            AND village_id = (SELECT id FROM villages WHERE user_id = ?)",
            [$buildingId, $userId]
        );
    }

    public function getBuildingTypes()
    {
        return $this->queryAll("SELECT id, type, name, hp, price FROM building_types");
    }

    public function getUnitTypes()
    {
        return $this->queryAll("SELECT id, type, name, hp, price FROM unit_types");
    }


    public function createVillage($userId, $x, $y)
    {
        return $this->execute(
            "INSERT INTO villages (user_id, x, y) VALUES (?, ?, ?)",
            [$userId, $x, $y]
        );
    }


    // Методы для работы с доходом шахт
public function getMineById($mineId, $userId) {
    return $this->query(
        "SELECT b.*, bt.income, bt.income_interval 
         FROM buildings AS b 
         JOIN building_types AS bt ON b.type_id = bt.id 
         WHERE b.id = ? 
         AND b.village_id = (SELECT id FROM villages WHERE user_id = ?)
         AND bt.type = 'mine'", 
        [$mineId, $userId]
    );
}

public function getMinesByUser($userId) {
    return $this->queryAll(
        "SELECT b.*, bt.type, bt.income, bt.income_interval 
         FROM buildings AS b 
         JOIN building_types AS bt ON b.type_id = bt.id 
         WHERE b.village_id = (SELECT id FROM villages WHERE user_id = ?)
         AND bt.type = 'mine'", 
        [$userId]
    );
}

public function updateMineIncomeTime($mineId, $userId, $incomeTime) {
    return $this->execute(
        "UPDATE buildings SET last_income_time = ? 
         WHERE id = ? 
         AND village_id = (SELECT id FROM villages WHERE user_id = ?)",
        [$incomeTime, $mineId, $userId]
    );
}

public function addUserIncome($userId, $amount) {
    return $this->execute(
        "UPDATE users SET money = money + ? WHERE id = ?",
        [$amount, $userId]
    );
}

public function getUserGold($userId) {
    return $this->query("SELECT money FROM users WHERE id = ?", [$userId]);
}

public function updateUserGold($userId, $gold) {
    return $this->execute("UPDATE users SET money = ? WHERE id = ?", [$gold, $userId]);
}
}
