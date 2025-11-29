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

    public function getUnit($unitId, $villageId) {
        return $this->query("SELECT x, y FROM units WHERE id = ? AND village_id = ?",
        [$unitId, $villageId]);
    }

    public function getUnits($userId)
    {
        return $this->queryAll(
            "SELECT 
                u.id AS id,
                u.type_id AS typeId,
                u.village_id AS villageId,
                u.x AS x,
                u.y AS y,
                u.level AS level,
                u.current_hp AS currentHp,
                u.on_a_crusade AS onAСrusade,
                ut.type AS type
            FROM units AS u
            INNER JOIN unit_types AS ut
            ON u.type_id = ut.id
            WHERE village_id = (SELECT id FROM villages WHERE user_id = ?)",
            [$userId]
        );
    }

    public function buyUnit($villageId, $unitId, $x, $y, $hp) {
    $this->execute("INSERT INTO units
        (type_id, village_id, x, y, current_hp) VALUES (?, ?, ?, ?, ?)", 
        [$unitId, $villageId, $x, $y, $hp]
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

    public function updateUnitsPosition($units, $villageId) {
        $coordinatesX = [];
        $coordinatesY = [];
        $validUnits = [];

        foreach ($units as $unit) {
            $unitId = (int) $unit['unitId'];
            $x = (int) $unit['x'];
            $y = (int) $unit['y'];

            $coordinatesX[] = "WHEN $unitId THEN $x";
            $coordinatesY[] = "WHEN $unitId THEN $y";
            $validUnits[] = $unitId;
        }

        $unitsStr = implode(',', $validUnits);
        $xStr = implode(' ', $coordinatesX);
        $yStr = implode(' ', $coordinatesY);

        return $this->execute(
            "UPDATE units SET
            x = CASE id $xStr END,
            y = CASE id $yStr END
            WHERE id IN ($unitsStr) AND village_id = ?",
            [$villageId]
        );
    }

    public function updateUnitsHP($units, $villageId) {
        $hpArr = [];
        $validUnits = [];

        foreach ($units as $unit) {
            $unitId = (int) $unit['unitId'];
            $hp = (int) $unit['hp'];

            $hpArr[] = "WHEN $unitId THEN $hp";
            $validUnits[] = $unitId;
        }

        $unitsStr = implode(',', $validUnits);
        $hpStr = implode(' ', $hpArr);

        return $this->execute(
            "UPDATE units SET
            current_hp = CASE id $hpStr END
            WHERE id IN ($unitsStr) AND village_id = ?",
            [$villageId]
        );
    }

    

    public function deleteUnit($unitId, $villageId)
    {
        return $this->execute("
            DELETE FROM units 
            WHERE id = ? AND village_id = ?", 
            [$unitId, $villageId]
        );
    }

    public function getBuildings($userId)
    {
        return $this->queryAll(
            "SELECT 
                b.id AS id, 
                b.type_id AS typeId, 
                b.village_id AS villageId, 
                b.x AS x, 
                b.y AS y,
                b.level AS level,
                b.current_hp AS currentHp,
                bt.type AS type
            FROM buildings AS b
            INNER JOIN building_types AS bt
            ON b.type_id = bt.id
            WHERE village_id = (SELECT id FROM villages WHERE user_id = ?)",
            [$userId]
        );
    }

    public function buyBuilding($villageId, $buildingId, $x, $y, $hp) {
        $this->execute("INSERT INTO buildings
            (type_id, village_id, x, y, current_hp) VALUES (?, ?, ?, ?, ?)", 
            [$buildingId, $villageId, $x, $y, $hp]
        );
    }

    public function getBuilding($buildingId, $villageId) {
        return $this->query(
            "SELECT id, type_id  AS typeId
            FROM buildings
            WHERE id = ? AND village_id = ?",
            [$buildingId, $villageId]
        );
    }

    public function getVillage($userId) {
        return $this->query("SELECT id, x, y, last_income_datetime FROM villages WHERE user_id = ?", [$userId]);
    }

    public function getBuildingType($buildingType) {
        return $this->query("SELECT id, hp, price FROM building_types WHERE id = ?", [$buildingType]);
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

    public function deleteBuilding($buildingId, $villageId)
    {
        return $this->execute(
            "DELETE FROM buildings
            WHERE id = ? AND village_id = ?",
            [$buildingId, $villageId]
        );
    }

    public function getBuildingTypes()
    {
        return $this->queryAll("SELECT id, type, hp, price, unlock_level as unlockLevel FROM building_types");
    }

    public function getUnitTypes()
    {
        return $this->queryAll("SELECT id, type, hp, price, unlock_level as unlockLevel FROM unit_types");
    }


    public function createVillage($userId, $x, $y)
    {
        return $this->execute(
            "INSERT INTO villages (user_id, x, y) VALUES (?, ?, ?)",
            [$userId, $x, $y]
        );
    }

    public function createBuilding($villageId, $buildingType, $x, $y)
    { 
        return $this->execute(
            "INSERT INTO buildings (village_id, type_id, x, y, level, current_hp) VALUES (?, ?, ?, ?, 1, 100)",
            [$villageId, $buildingType, $x, $y]
        );
    }

    public function getMine($villageId) {
        return $this->query(
            "SELECT b.level AS level
            FROM buildings AS b
            INNER JOIN building_types AS bt
            ON b.type_id = bt.id AND bt.type = 'mine'
            WHERE b.village_id = ?",
            [$villageId]
        );
    }

    public function updateLastIncome($villageId) {
        $now = date('Y-m-d H:i:s');
        return $this->execute(
            "UPDATE villages SET last_income_datetime = ? WHERE id = ?",
            [$now, $villageId]
        );
    }

    public function sendArmy($userId, $targetX, $targetY, $targetId, $units) {
        $army = [];
        foreach($units as $unit) {
            $army[] = $unit['id'];
        }

        $armyString = implode(',', $army);

        return $this->execute("INSERT INTO army (userId, x, y, attackId, units) VALUES (?, ?, ?, ?, ?)",
        [$userId, $targetX, $targetY, $targetId, $armyString]);
    }

    public function unitsOnACrusade($villageId, $units) {
        $army = [];
        foreach($units as $unit) {
            $army[] = $unit['id'];
        }

        $placeholder = implode(',', array_fill(0, count($army), '?'));

        $params = array_merge($army, [$villageId]);

        return $this->execute("UPDATE units SET on_a_crusade = 1 WHERE id IN ($placeholder) AND village_id = ?",
        $params);
    }
}
