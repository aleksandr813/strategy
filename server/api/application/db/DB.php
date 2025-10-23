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

    public function registration($login, $hash, $name)
    {
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

    public function getUnits($userId)
    {
        return $this->queryAll(
            "SELECT u.id, u.type_id, u.village_id, u.x, u.y, u.level, u.current_hp 
            FROM units AS u
            INNER JOIN villages AS v
            ON u.village_id = v.id
            WHERE v.user_id = ?
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

    public function isOccupied($villageId, $x, $y) {
        $result = $this->query(
            "SELECT EXISTS (
                SELECT 1 FROM units WHERE village_id = ? AND x = ? AND y = ?
            ) OR EXISTS (
                SELECT 1 FROM buildings WHERE village_id = ? AND x = ? AND y = ?
            ) AS occupied",
            [$villageId, $x, $y, $villageId, $x, $y]
        );

        return !empty($result) && $result->occupied == 1;
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

    public function getBuildings($userId)
    {
        return $this->queryAll(
            "SELECT id, type_id, village_id, x, y, level, current_hp FROM buildings
            WHERE village_id = (SELECT id FROM villages WHERE user_id = ?)
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

    public function getVillage($userId) {
        return $this->query("SELECT id, last_income_datetime FROM villages WHERE user_id = ?", [$userId]);
    }

    public function getBuildingType($buildingType) {
        return $this->query("SELECT hp, price FROM building_types WHERE id = ?", [$buildingType]);
    }

    public function getUnitType($unitType) {
        return $this->query("SELECT hp, price FROM unit_types WHERE id = ?", [$unitType]);
    }

    public function getMoney($userId) {
        return $this->query("SELECT money FROM users WHERE id = ?", [$userId]);
    }

    public function updateMoney($userId, $money) {
        return $this->execute("UPDATE users SET money = ? WHERE id = ?", [$money, $userId]);
    }

    public function upgradeBuilding($buildingId, $villageId) {
        return $this->execute("UPDATE buildings SET level = level + 1 WHERE id = ? AND village_id = ?",
            [$buildingId, $villageId]
        );
    }

    public function getLevel($buildingId, $villageId) {
        return $this->query("SELECT level FROM buildings WHERE id = ? AND village_id = ?",
            [$buildingId, $villageId]
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
}
