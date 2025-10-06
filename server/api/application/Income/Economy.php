<?php
require_once ('db/DB.php');

class Economy {
    private $db;
    
    function __construct($db) {
        $this->db = $db;
    }

    // Функция getIncome - рассчитывает общий доход пользователя
    public function getIncome($userId) {
        $sql = "SELECT SUM(income) as total_income FROM buildings WHERE user_id = ?";
        $result = $this->db->query($sql, [$userId]);
        return $result ? ($result['total_income'] ?? 0) : 0;
    }

    // Получить текущее состояние экономики пользователя
    public function getEconomyState($userId) {
        $sql = "SELECT gold, last_update FROM users WHERE id = ?";
        $user = $this->db->query($sql, [$userId]);
        
        if (!$user) return null;
        
        $income = $this->getIncome($userId);
        $currentTime = time();
        $timePassed = $currentTime - $user['last_update'];
        
        // Автоматическое начисление дохода
        if ($timePassed > 0) {
            $goldEarned = $income * ($timePassed / 10); // Каждые 10 секунд
            $newGold = $user['gold'] + $goldEarned;
            
            // Обновляем золото и время
            $updateSql = "UPDATE users SET gold = ?, last_update = ? WHERE id = ?";
            $this->db->query($updateSql, [$newGold, $currentTime, $userId]);
            
            $user['gold'] = $newGold;
        }
        
        return [
            'gold' => floor($user['gold']),
            'total_income' => $income,
            'last_update' => $user['last_update']
        ];
    }

    // Добавить золото пользователю
    public function addGold($userId, $amount) {
        $sql = "UPDATE users SET gold = gold + ? WHERE id = ?";
        return $this->db->query($sql, [$amount, $userId]);
    }

    // Списать золото
    public function deductGold($userId, $amount) {
        $sql = "SELECT gold FROM users WHERE id = ?";
        $user = $this->db->query($sql, [$userId]);
        
        if (!$user || $user['gold'] < $amount) {
            return false; // Недостаточно золота
        }
        
        $updateSql = "UPDATE users SET gold = gold - ? WHERE id = ?";
        return $this->db->query($updateSql, [$amount, $userId]);
    }

    // Получить активные источники дохода
    public function getIncomeSources($userId) {
        return $this->db->getBuildingsWithIncome($userId); 
    }

    // Покупка здания
    public function purchaseBuilding($userId, $buildingType, $cost, $income, $x, $y) {
        if (!$this->deductGold($userId, $cost)) {
            return ['error' => 'Недостаточно золота'];
        }
        
        return ['success' => true, 'gold_deducted' => $cost];
    }

    // Покупка юнита
    public function purchaseUnit($userId, $unitType, $cost) {
        if (!$this->deductGold($userId, $cost)) {
            return ['error' => 'Недостаточно золота'];
        }
        
        return ['success' => true, 'gold_deducted' => $cost];
    }
}
?>