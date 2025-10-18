<?php

class Unit
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getUnitById($unitId)
    {
        $unit = $this->db->getUnitById($unitId);
        if (!$unit) {
            return ['error' => 500];
        }

        return [
            'id' => $unit->id,
            'user_id' => $unit->user_id,
            'unit_type' => $unit->unit_type,
            'x' => $unit->x,
            'y' => $unit->y
        ];
    }

   


 public function buyUnit($user, $unitId,$x, $y) {
    $village = $this->db->getVillageByUserId($user->id);
    if (!$village) {
        return ['error' => 310]; 
    }
    
    $unit = $this->db->getUnitType($unitId);
    if (!$unit) {
        return ["error" => 401]; 
    }
    
    if ($user->money < $unit->price) {
        return ['error' => 305]; 
    }

    
    $existingUnit = $this->db->getPositionUnit($village->id, $x, $y);
    if ($existingUnit) {
        return ['error' => 411]; 
    }

    $newMoney = $user->money - $unit->price;
    $this->db->updateMoney($user->id, $newMoney);
    $this->db->buyUnit(
        $village->id,
        $unitType,
        $x,
        $y,
        $unit->hp
    );

    return [
        'money' => $newMoney
    ];
}


    public function getUnitsByUser($userId)
    {
        if (!$userId) {
            return ['error' => 705];
        }
        $units = $this->db->getUnitsByUser($userId);

        return ['units' => $units];
    }

    public function createUnit($userId, $unitType, $x, $y)
    {
        $unit = $this->db->createUnit($userId, $unitType, $x, $y);
        if ($unit) {
            return [
                'user_id' => $userId,
                'unit_type' => $unitType,
                'x' => $x,
                'y' => $y
            ];
        } else {
            return ['error' => 501];
        }
    }

    public function updateUnit($unitId, $userId, $unitType, $x, $y)
    {
        $result = $this->db->updateUnit($unitId, $userId, $unitType, $x, $y);
        if ($result) {
            return [
                'id' => $unitId,
                'user_id' => $userId,
                'unit_type' => $unitType,
                'x' => $x,
                'y' => $y
            ];
        }
        return ['error' => 502];
    }

    public function deleteUnit($unitId, $userId)
    {
        $result = $this->db->deleteUnit($unitId, $userId);
        if (!$result) {
            return ['error' => 503];
        }

        //Что возвращать при успешном удалении юнита?
    }

    public function getUnitTypes()
    {
        $types = $this->db->getUnitTypes();
        return ["unit_types" => $types];
    }
}
