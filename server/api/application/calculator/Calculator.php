<?php
class Calculator{
    public function __construct(...$arr) {
        $params = [];
        if (isset($arr['a'])) $params[] = (float)$arr['a'];
        if (isset($arr['b'])) $params[] = (float)$arr['b'];
        if (isset($arr['c'])) $params[] = (float)$arr['c'];
        if (isset($arr['d'])) $params[] = (float)$arr['d'];
        if (isset($arr['e'])) $params[] = (float)$arr['e'];
            
        switch (count($params)) {
            case 2:
                $result = self::solveLinear(...$params);
                break;
            case 3:
                $result = self::solveQuadratic(...$params);
                break;
            case 4:
                $result = self::solveCubic(...$params);
                break;
            case 5:
                $result = self::solveQuartic(...$params);
                break;
            default:
                $result = ['error' => 103];
                http_response_code(400);
        };
        $this->$result = $result;
    }
private static function solveLinear($a, $b) { 
    if ($a == 0) {
        return ['error' => 104];
    }
    return [-$b / $a]; 
}
    

// Функция для решения квадратного уравнения: ax2 + bx + c = 0
private static function solveQuadratic($a, $b, $c) {
    if ($a == 0) {
        return self::solveLinear( $b, $c);
    }
    $discriminant = $b * $b - 4 * $a * $c;
    
    if ($discriminant > 0) {
        $x1 = (-$b + sqrt($discriminant)) / (2 * $a);
        $x2 = (-$b - sqrt($discriminant)) / (2 * $a);
        return [$x1, $x2];
    } elseif ($discriminant == 0) {
        return [-$b / (2 * $a)];
    } else {
        return ['error' => 105];
    }
}

// Функция для решения кубического уравнения: ax3 + bx2 + cx + d = 0
private static function solveCubic($a, $b, $c, $d) {
    if ($a == 0) {
        return self::solveQuadratic($b, $c, $d);
    }
    // Нормализация коэффициентов
    $b /= $a;
    $c /= $a;
    $d /= $a;
    
    $p = $c - $b*$b/3;
    $q = (2*$b*$b*$b - 9*$b*$c + 27*$d)/27;
    $discr = $q*$q/4 + $p*$p*$p/27;
    
    $roots = [];
    $offset = -$b/3;
    
    if (abs($discr) < 1e-10) {
        $u = $q > 0 ? -pow($q/2, 1/3) : pow(-$q/2, 1/3);
        $roots = [
            round(2*$u + $offset, 10),
            round(-$u + $offset, 10)
        ];
    } elseif ($discr > 0) {
        $u = -$q/2 + sqrt($discr);
        $v = -$q/2 - sqrt($discr);
        $u = $u < 0 ? -pow(-$u, 1/3) : pow($u, 1/3);
        $v = $v < 0 ? -pow(-$v, 1/3) : pow($v, 1/3);
        $roots = [round($u + $v + $offset, 10)];
    } else {
        $r = sqrt(-$p*$p*$p/27);
        $phi = acos(-$q/(2*$r));
        $r = 2*pow($r, 1/3);
        
        for ($k = 0; $k < 3; $k++) {
            $roots[] = round($r*cos(($phi + 2*M_PI*$k)/3) + $offset, 10);
        }
    }
    
    return $roots;
}

private static function solveQuartic($a, $b, $c, $d, $e) {
    if ($a == 0) {
        return self::solveCubic($b, $c, $d, $e);
    }
    
    $b /= $a;
    $c /= $a;
    $d /= $a;
    $e /= $a;
    $a = 1;
    
    $possibleRoots = [];
    $e_int = (int)round($e);
    
    // Генерируем возможные целые корни
    if ($e_int != 0) {
        for ($i = -abs($e_int); $i <= abs($e_int); $i++) {
            if ($i != 0 && abs($e_int) % abs($i) == 0) {
                $possibleRoots[] = $i;
            }
        }
    }
    $possibleRoots[] = 0; 

    $possibleRoots = array_unique($possibleRoots);
    sort($possibleRoots);
    
    $foundRoot = null;
    

    foreach ($possibleRoots as $root) {
        $value = $a * pow($root, 4) + $b * pow($root, 3) + $c * pow($root, 2) + $d * $root + $e;
        if (abs($value) < 1e-8) {
            $foundRoot = $root;
            break;
        }
    }
    
    if ($foundRoot === null) {
        $possibleFractionRoots = [];
        
        $divisors_e = [];
        $e_int = (int)round($e);
        if ($e_int != 0) {
            for ($i = 1; $i <= abs($e_int); $i++) {
                if ($e_int % $i == 0) {
                    $divisors_e[] = $i;
                    $divisors_e[] = -$i;
                }
            }
        }
        
        $divisors_a = [1, -1];
        
        foreach ($divisors_e as $p) {
            foreach ($divisors_a as $q) {
                if ($q != 0) {
                    $possibleFractionRoots[] = $p / $q;
                }
            }
        }
        
        $possibleFractionRoots = array_unique($possibleFractionRoots);
        
        foreach ($possibleFractionRoots as $root) {
            $value = $a * pow($root, 4) + $b * pow($root, 3) + $c * pow($root, 2) + $d * $root + $e;
            if (abs($value) < 1e-8) {
                $foundRoot = $root;
                break;
            }
        }
    }
    
    // Если корень найден, выполняем деление полинома
    if ($foundRoot !== null) {
        $coeff = [1, $b, $c, $d, $e];
        $result = [1];
        
        $current = 1;
        for ($i = 1; $i < 4; $i++) {
            $current = $current * $foundRoot + $coeff[$i];
            $result[] = $current;
        }
        
        // result содержит коэффициенты кубического уравнения: x^3 + A*x^2 + B*x + C
        $A = $result[1];
        $B = $result[2];
        $C = $result[3];
        
        $cubicRoots = self::solveCubic(1, $A, $B, $C);
        
        $roots = array_merge([round($foundRoot, 10)], $cubicRoots);
        
        return $roots;
    } else {
        return ['error' => 106];
    }
}
}