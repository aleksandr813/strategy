<?php

class Answer
{
    static $CODES = array(
        '101' => 'Param method not setted',
        '102' => 'Method not found',
        '103' => 'Неверное количество аргументов',
        '104' => 'Бесконечно корней',
        '105' => 'Действительных корней нет',
        '106' => 'Рациональный корень не найден',
        '242' => 'Params not set fully',
        '300' => 'Building is not found',
        '301' => 'Failed to buy building',
        '302' => 'Failed to update building',
        '303' => 'Failed to delete building',
        '305' => 'Not enough funds to buy',
        '306' => 'Transaction error',
        '310' => 'Village not found',
        '311' => 'Coordinates are busy',
        '410' => 'Mine is not found',
        '411' => 'Failed to update mine income time', 
        '412' => 'Failed to add income to user',
        '413' => 'Failed to update mine income data',
        '500' => 'Unit is not found',
        '501' => 'Failed to buy unit',
        '502' => 'Failed to update unit',
        '503' => 'Failed to delete unit',
        '705' => 'User is not found',
        '1001' => 'Is it unique login?',
        '1002' => 'Wrong login or password',
        '1003' => 'Error to logout user',
        '1004' => 'Error to register user',
        '1005' => 'User is no exists',
        '1006' => 'User with this email is already registered',
        '1007' => 'Неправильная длина логина',
        '1008' => 'Логин начинается с цифры или подчеркивания',
        '1009' => 'Недопустимые символы в логине',
        '1010' => 'Логин содержит пробелы или специальные символы',
        '1011' => 'Слишком короткий пароль',
        '1012' => 'Пароль без разных регистров',
        '1013' => 'Пароль без цифр',
        '1014' => 'Пароль содержит персональную информацию',
        '1015' => 'Пароли не совпадают',
        '1090' => 'Ошибка создания деревни',
        '404' => 'not found',
        '605' => 'invalid teamId',
        '700' => 'No skins',
        '701' => 'Skin is not found',
        '706' => 'text message is empty',
        '707' => 'could not send message',
        '708' => 'invalid code from E-mail',
        '709' => ' session did not start or you need use previous method',
        '800' => 'not found object',
        '801' => 'unknown state',
        '1016' => 'params login or password not set',
        '9000' => 'unknown error'
    );

    static function response($data)
    {
        if ($data) {
            if (!is_bool($data) && array_key_exists('error', $data)) {
                $code = $data['error'];
                return [
                    'result' => 'error',
                    'error' => [
                        'code' => $code,
                        'text' => self::$CODES[$code]
                    ]
                ];
            }
            return [
                'result' => 'ok',
                'data' => $data
            ];
        }
        $code = 9000;
        return [
            'result' => 'error',
            'error' => [
                'code' => $code,
                'text' => self::$CODES[$code]
            ]
        ];
    }
}
