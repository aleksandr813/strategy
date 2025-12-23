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

    public function getUnit($unitId, $villageId)
    {
        return $this->query(
            "SELECT x, y FROM units WHERE id = ? AND village_id = ?",
            [$unitId, $villageId]
        );
    }

    public function getUnits($villageId)
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
                u.on_a_crusade AS onACrusade,
                u.is_enemy AS isEnemy,
                ut.type AS type,
                ut.speed AS speed,
                ut.range_attack AS rangeAttack,
                ut.damage AS damage
            FROM units AS u
            INNER JOIN unit_types AS ut
            ON u.type_id = ut.id
            WHERE village_id = ?",
            [$villageId]
        );
    }

    public function buyUnit($villageId, $unitId, $x, $y, $hp)
    {
        $this->execute(
            "INSERT INTO units
        (type_id, village_id, x, y, current_hp) VALUES (?, ?, ?, ?, ?)",
            [$unitId, $villageId, $x, $y, $hp]
        );
    }

    public function isOccupied($villageId, $x, $y)
    {
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

    public function updateUnitsPosition($units, $villageId)
    {
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

    public function updateUnitsHP($units, $villageId)
    {
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
        return $this->execute(
            "
            DELETE FROM units 
            WHERE id = ? AND village_id = ?",
            [$unitId, $villageId]
        );
    }

    public function getBuildings($villageId)
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
            WHERE village_id = ?",
            [$villageId]
        );
    }

    public function buyBuilding($villageId, $buildingId, $x, $y, $hp)
    {
        $this->execute(
            "INSERT INTO buildings
            (type_id, village_id, x, y, current_hp) VALUES (?, ?, ?, ?, ?)",
            [$buildingId, $villageId, $x, $y, $hp]
        );
    }

    public function getBuilding($buildingId, $villageId)
    {
        return $this->query(
            "SELECT id, type_id  AS typeId
            FROM buildings
            WHERE id = ? AND village_id = ?",
            [$buildingId, $villageId]
        );
    }

    public function getVillage($userId)
    {
        return $this->query("
            SELECT 
                id, 
                x, 
                y, 
                last_income_datetime, 
                attack_id AS attackId 
            FROM villages 
            WHERE user_id = ?", 
            [$userId]
        );
    }

    public function getVillages() {
        return $this->queryAll("
            SELECT
                v.id, 
                v.user_id AS userId, 
                v.x, 
                v.y,
                v.attack_id AS attackId,
                u.name
            FROM villages AS v
            INNER JOIN users AS u
            ON v.user_id = u.id
            "
        );
    }

    public function getBuildingType($buildingType) {
        return $this->query("SELECT id, hp, price FROM building_types WHERE id = ?", [$buildingType]);
    }

    public function getUnitType($unitType)
    {
        return $this->query("SELECT hp, price FROM unit_types WHERE id = ?", [$unitType]);
    }

    public function getMoney($userId)
    {
        return $this->query("SELECT money FROM users WHERE id = ?", [$userId]);
    }

    public function updateMoney($userId, $money)
    {
        return $this->execute("UPDATE users SET money = ? WHERE id = ?", [$money, $userId]);
    }

    public function upgradeBuilding($buildingId, $villageId)
    {
        return $this->execute(
            "UPDATE buildings SET level = level + 1 WHERE id = ? AND village_id = ?",
            [$buildingId, $villageId]
        );
    }

    public function getLevel($buildingId, $villageId)
    {
        return $this->query(
            "SELECT level FROM buildings WHERE id = ? AND village_id = ?",
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

    public function getMine($villageId)
    {
        return $this->query(
            "SELECT b.level AS level
            FROM buildings AS b
            INNER JOIN building_types AS bt
            ON b.type_id = bt.id AND bt.id = 2
            WHERE b.village_id = ?",
            [$villageId]
        );
    }

    public function updateLastIncome($villageId)
    {
        $now = date('Y-m-d H:i:s');
        return $this->execute(
            "UPDATE villages SET last_income_datetime = ? WHERE id = ?",
            [$now, $villageId]
        );
    }

    public function sendArmy($userId, $startX, $startY, $startTime, $arrivalTime, $targetX, $targetY, $targetId, $units, $speed) {
        $army = [];
        foreach ($units as $unit) {
            $army[] = $unit['id'];
        }

        $armyString = implode(',', $army);

        return $this->execute("
        INSERT INTO army 
        (userId, startX, startY, startTime, arrivalTime, targetX, targetY, attackId, units, speed) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [$userId, $startX, $startY, $startTime, $arrivalTime, $targetX, $targetY, $targetId, $armyString, $speed]);
    }

    public function markVillageAsAttacked($attackerVillageId, $targetVillageId) {
        return $this->execute("UPDATE villages SET attack_id = ? WHERE id = ?", [$attackerVillageId, $targetVillageId]);
    }

    public function unitsOnACrusade($villageId, $units)
    {
        $army = [];
        foreach ($units as $unit) {
            $army[] = $unit['id'];
        }

        $placeholder = implode(',', array_fill(0, count($army), '?'));

        $params = array_merge($army, [$villageId]);

        return $this->execute(
            "UPDATE units SET on_a_crusade = 1 WHERE id IN ($placeholder) AND village_id = ?",
            $params
        );
    }

    public function unitsOffACrusade($units, $villageId)
    {
        $army = [];
        foreach ($units as $unit) {
            $army[] = $unit['id'];
        }

        $placeholder = implode(',', array_fill(0, count($army), '?'));

        $params = array_merge($army, [$villageId]);

        return $this->execute(
            "UPDATE units SET on_a_crusade = 0 WHERE id IN ($placeholder) AND village_id = ?",
            $params
        );
    }

    public function deleteArmy($userId, $armyId) {
        return $this->execute("DELETE FROM army WHERE userId = ? AND army = ?", [$userId, $armyId]);
    }

    public function getArmy($armyId) {
        return $this->query("
        SELECT 
            army, 
            userId, 
            startX, 
            startY,
            startTime,
            arrivalTime,
            targetX,
            targetY, 
            attackId, 
            units,
            speed
        FROM army
        WHERE army = ?",
        [$armyId]);
    }

    public function getUnitsInArmy($armyId) {
        $army = $this->getArmy($armyId);

        $unitIds = explode(',', $army->units);
        $placeholder = implode(',', array_fill(0, count($unitIds), '?'));

        return $this->queryAll(
            "SELECT
                u.id,
                u.village_id AS villageId,
                u.x,
                u.y,
                u.current_hp AS currentHp,
                u.on_a_crusade AS onACrusade
            FROM units AS u
            WHERE u.id IN ($placeholder)",
            $unitIds
        );
    }

    public function getArmies() {
        $result = $this->queryAll("
        SELECT 
            army, 
            userId, 
            startX, 
            startY,
            startTime,
            arrivalTime,
            targetX,
            targetY, 
            attackId, 
            units,
            speed
        FROM army");

        foreach($result as &$army) {
            $army['units'] = array_map('intval', explode(',', $army['units']));
        }

        return $result;
    }

    public function deleteArmyById($armyId) {
        return $this->execute(
            "DELETE FROM army WHERE army = ?", [$armyId]
        );
    }

    public function getUnitsSpeed($units) {
        $unitIds = [];
        foreach($units as $unit) {
            $unitIds[] = $unit['id'];
        }

        $placeholder = implode(',', array_fill(0, count($unitIds), '?'));

        return $this->queryAll(
            "SELECT u.id, ut.speed
            FROM units AS u
            INNER JOIN unit_types AS ut
            ON u.type_id = ut.id
            WHERE u.id IN ($placeholder)",
            $unitIds
        );
    }

    public function getMapHash() {
        return $this->query("SELECT id, hash FROM map_hashes WHERE id = 1");
    }

    public function updateMapHash($hash) {
        return $this->execute("UPDATE map_hashes SET hash = ? WHERE id = 1", [$hash]);
    }

    public function getUserArmies($userId) {
        $result = $this->queryAll(
            "SELECT a.army AS armyId, a.units, a.attackId, u.name AS enemyName, a.speed, a.startTime, a.arrivalTime
            FROM army AS a
            INNER JOIN users u ON a.attackId = u.id
            WHERE a.userId = ?",
            [$userId]
        );

        foreach($result as &$army) {
            $army['units'] = array_map('intval', explode(',', $army['units']));
        }

        return $result;
    }

    public function addObjectsToBattle($objects, $type, $battleId) {
        $insertData = [];
        $params = [];

        foreach($objects as $object) {
            $insertData[] = "(?, ?, ?, ?, ?, ?, ?)";
            $params = array_merge($params, [
                $battleId,
                $type,
                (int)$object['id'],
                (int)$object['villageId'],
                (int)$object['x'],
                (int)$object['y'],
                (int)$object['currentHp']
            ]);
        }

        $placeholder = implode(',', $insertData);

        return $this->execute(
            "INSERT INTO battle_objects
            (battle_id, object_type, original_id, owner_village_id, x, y, current_hp)
            VALUES $placeholder",
            $params
        );
    }

    public function getBattleHash($battleId) {
        return $this->query("SELECT hash FROM battles WHERE id = ?", [$battleId]);
    }

    public function updateBattleHash($battleId, $hash) {
        return $this->execute("UPDATE battles SET hash = ? WHERE id = ?", [$hash, $battleId]);
    }

    public function startBattle($attackerVillageId, $defenderVillageId, $attackerLastOnline, $defenderLastOnline, $hash) {
        $this->execute(
            "INSERT INTO battles 
            (attacker_village_id, defender_village_id, attacker_last_online, defender_last_online, hash)
            VALUES (?, ?, ?, ?, ?)",
            [$attackerVillageId, $defenderVillageId, $attackerLastOnline, $defenderLastOnline, $hash]
        );

        return $this->pdo->lastInsertId();
    }

    public function getActiveBattle($villageId) {
        return $this->query(
            "SELECT 
                id, 
                attacker_village_id AS attackerVillageId, 
                defender_village_id AS defenderVillageId,
                attacker_last_online AS attackerLastOnline,
                defender_last_online AS defenderLastOnline,
                hash 
            FROM battles
            WHERE (attacker_village_id = ? OR defender_village_id = ?)",
            [$villageId, $villageId]
        );
    }

    public function getBattleObjects($battleId) {
        return $this->queryAll(
            "SELECT
                id,
                battle_id AS battleId,
                object_type AS objectType,
                original_id AS orirginalId,
                owner_village_id AS ownerVillageId,
                x,
                y,
                current_hp AS currentHp
            FROM battle_objects
            WHERE battle_id = ?",
            [$battleId]
        );
    }

    public function updateAttackerStatus($battleId, $timestamp) {
        return $this->execute(
            "UPDATE battles SET attacker_last_online = ? WHERE id = ?",
            [$timestamp, $battleId]
        );
    }

    public function updateDefenderStatus($battleId, $timestamp) {
        return $this->execute(
            "UPDATE battles SET defender_last_online = ? WHERE id = ?",
            [$timestamp, $battleId]
        );
    }

    public function markVillageAttack($villageId) {
        return $this->execute("UPDATE villages SET is_attacked = 1 WHERE id = ?", [$villageId]);
    }
}
