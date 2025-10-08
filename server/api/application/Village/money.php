<?php
// я как пример использовал структуру файла server/api/application/building/Building.php
class MineIncome {
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getIncome($mineId, $userId) {
        // Получаем данные шахты
        $mine = $this->db->getMineById($mineId, $userId);
        if (!$mine) {
            return ['error' => 410];
        }

        $currentTime = time();
        $lastIncomeTime = $mine->last_income_time;
        $incomeInterval = $mine->income_interval;

        // Проверяем, прошло ли достаточно времени с последнего начисления
        $timeSinceLastIncome = $currentTime - $lastIncomeTime;
        
        if ($timeSinceLastIncome >= $incomeInterval) {
            // Рассчитываем количество полных интервалов
            $intervalsPassed = floor($timeSinceLastIncome / $incomeInterval);
            $incomeAmount = $mine->income_per_interval * $intervalsPassed;
            
            // Обновляем время последнего начисления
            $newLastIncomeTime = $lastIncomeTime + ($intervalsPassed * $incomeInterval);
            $result = $this->db->updateMineIncomeTime($mineId, $userId, $newLastIncomeTime);
            
            if (!$result) {
                return ['error' => 411];
            }

            // Начисляем доход пользователю
            $incomeResult = $this->db->addUserIncome($userId, $incomeAmount);
            if (!$incomeResult) {
                return ['error' =>412];
            }

            return [
                'success' => true,
                'needs_update' => true,
                'income_amount' => $incomeAmount,
                'intervals_passed' => $intervalsPassed,
                'last_income_time' => $newLastIncomeTime,
                'current_time' => $currentTime,
                'mine_id' => $mineId
            ];
        }
        else {
            // Время еще не пришло))
            $timeRemaining = $incomeInterval - $timeSinceLastIncome;
            
            return [
                'success' => true,
                'needs_update' => false,
                'time_remaining' => $timeRemaining,
                'last_income_time' => $lastIncomeTime,
                'current_time' => $currentTime,
                'mine_id' => $mineId
            ];
        }
    }

    public function getAllMinesIncome($userId) {
        if (!$userId) {
            return ['error' => 705];
        }

        $mines = $this->db->getMinesByUser($userId);
        $results = [];

        foreach ($mines as $mine) {
            $incomeResult = $this->getIncome($mine->id, $userId);
            $results[] = [
                'mine_id' => $mine->id,
                'mine_type' => $mine->building_type,
                'income_result' => $incomeResult
            ];
        }

        return ['mines_income' => $results];
    }

    public function updateMineIncomeTime($mineId, $userId, $incomeTime) {
        $result = $this->db->updateMineIncomeTime($mineId, $userId, $incomeTime);
        if (!$result) {
            return ['error' => 413];
        }

        return [
            'id' => $mineId,
            'user_id' => $userId,
            'last_income_time' => $incomeTime
        ];
    }
}