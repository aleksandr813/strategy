<?php
class MatrixService {
    function __construct() {
        
    }

    public function convertToBooleanMatrix($matrix) {
        if (!is_array($matrix)) {
            return ['error' => 'Неверные входные данные'];
        }

        $answer = [];
        for ($i = 0; $i < count($matrix); $i++) {
            for ($j = 0; $j < count($matrix[$i]); $j++) {
                $cell = $matrix[$i][$j];
                $answer[$i][$j] = $cell->isEmpty() ? 0 : 1;
            }
        }
        return $answer;
    }

    public function convertToObjectMatrix($matrix) {
        if (!is_array($matrix)) {
            return ['error' => 'Неверные входные данные'];
        }
        
        $answer = [];
        for ($i = 0; $i < count($matrix); $i++) {
            for ($j = 0; $j < count($matrix[$i]); $j++) {
                $cell = $matrix[$i][$j];
                $answer[$i][$j] = $cell->isEmpty() ? null : $cell->getContent();
            }
        }
        return $answer;
    }
}