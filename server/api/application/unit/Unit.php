<?php

class Unit
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getUnitsByUser($userId)
    {
        if (!$userId) {
            return ['error' => 705];
        }
        $units = $this->db->getUnitsByUser($userId);

        return ['units' => $units];
    }

    public function buyUnit($user, $typeId, $x, $y)
    {
        $village = $this->db->getVillage($user->id);
        if (!$village) {
            return ['error' => 310];
        }
        $unit = $this->db->getUnitType($typeId);
        if (!$unit) {
            return ["error" => 501];
        }
        if ($user->money < $unit->price) {
            return ['error' => 305];
        }

        $existingUnit = $this->db->isOccupied($village->id, $x, $y);
        if ($existingUnit) {
            return ['error' => 311];
        }

        $newMoney = $user->money - $unit->price;
        $this->db->updateMoney($user->id, $newMoney);
        $this->db->buyunit(
            $village->id,
            $typeId,
            $x,
            $y,
            $unit->hp
        );

        return [
            'money' => $newMoney
        ];
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

    }

    public function getUnitTypes()
    {
        $types = $this->db->getUnitTypes();
        return ["unit_types" => $types];
    }
}
