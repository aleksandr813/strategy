<?php

class DB {
    private $pdo;

    function __construct() {
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

    public function __destruct() {
        $this->pdo = null;
    }

    // выполнить запрос без возвращения данных
    private function execute($sql, $params = []) {
        $sth = $this->pdo->prepare($sql);
        return $sth->execute($params);
    }

    // получение ОДНОЙ записи
    private function query($sql, $params = []) {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetch(PDO::FETCH_OBJ);
    }

    // получение НЕСКОЛЬКИХ записей
    private function queryAll($sql, $params = []) {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserByLogin($login) {
        return $this->query("SELECT * FROM users WHERE login=?", [$login]);
    }

    public function getUserByToken($token) {
        return $this->query("SELECT * FROM users WHERE token=?", [$token]);
    }

    public function updateToken($userId, $token) {
        $this->execute("UPDATE users SET token=? WHERE id=?", [$token, $userId]);
    }

    public function registration($login, $password, $name) {
        $this->execute("INSERT INTO users (login,password,name) VALUES (?, ?, ?)",[$login, $hash, $name]);
    }

    public function getChatHash() {
        return $this->query("SELECT * FROM hashes WHERE id=1");
    }

    public function updateChatHash($hash) {
        $this->execute("UPDATE hashes SET chat_hash=? WHERE id=1", [$hash]);
    }

    public function addMessage($userId, $message) {
        $this->execute('INSERT INTO messages (user_id, message, created) VALUES (?,?, now())', [$userId, $message]);
    }

    public function getMessages() {
        return $this->queryAll("SELECT u.name AS author, m.message AS message,
                                to_char(m.created, 'yyyy-mm-dd hh24:mi:ss') AS created FROM messages as m 
                                LEFT JOIN users as u on u.id = m.user_id 
                                ORDER BY m.created DESC"
        );
    }

    public function getUnitById($unitId) {
        return $this->query(
            "SELECT u.*
            FROM units AS u
            JOIN users ON u.user_id = users.id
            WHERE u.id = ?
        ", [$unitId]);
    }

    public function getUnitsByUser($userId) {
        return $this->queryAll(
            "SELECT * FROM units
            WHERE user_id = ?
            ORDER BY unit_type
        ", [$userId]);
    }

    public function createUnit($userId, $unitType, $x, $y) {
        return $this->execute("INSERT INTO units (user_id, unit_type, x, y) VALUES (?, ?, ?, ?)", 
            [$userId, $unitType, $x, $y]
        );
    }

    public function updateUnit($unitId, $userId, $unitType, $x, $y) {
        return $this->execute("UPDATE units SET unit_type = ?, x = ?, y = ? WHERE id = ? AND user_id = ?", 
            [$unitType, $x, $y, $unitId, $userId]
        );
    }

    public function deleteUnit($unitId, $userId) {
        return $this->execute("DELETE FROM units WHERE id = ? AND user_id = ?", [$unitId, $userId]);
    }

    public function getBuildingById($buildingId) {
        return $this->query(
            "SELECT b.*
            FROM buildings AS b
            JOIN users AS u ON b.user_id = u.id
            WHERE b.id = ?", 
        [$buildingId]);
    }

    public function getBuildings($userId) {
        return $this->queryAll(
            "SELECT id, type_id, village_id, x, y, level, current_hp FROM buildings
            WHERE village_id = (SELECT id FROM villages WHERE user_id = ?)
            ORDER BY type_id
        ", [$userId]);
    }

    public function createBuilding($userId, $buildingType, $x, $y) {
        return $this->execute("INSERT INTO buildings (user_id, building_type, x, y) VALUES (?, ?, ?, ?)",
            [$userId, $buildingType, $x, $y]
        );
    }

    public function updateBuilding($buildingId, $userId, $buildingType, $x, $y) {
        return $this->execute("UPDATE buildings SET building_type = ?, x = ?, y = ? WHERE id = ? AND user_id = ?",
            [$buildingType, $x, $y, $buildingId, $userId]
        );
    }

    public function deleteBuilding($buildingId, $userId) {
        return $this->execute("DELETE FROM buildings WHERE id = ? AND user_id = ?", [$buildingId, $userId]);
    }

    public function getBuildingTypes() {
        return $this->queryAll("SELECT id, type, name, hp, price FROM building_types");
    }
}