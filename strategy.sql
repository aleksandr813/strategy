-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Ноя 07 2025 г., 23:07
-- Версия сервера: 8.0.19
-- Версия PHP: 7.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `strategy`
--

-- --------------------------------------------------------

--
-- Структура таблицы `buildings`
--

CREATE TABLE `buildings` (
  `id` int NOT NULL,
  `type_id` int NOT NULL,
  `village_id` int NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  `level` int NOT NULL DEFAULT '1',
  `current_hp` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `buildings`
--

INSERT INTO `buildings` (`id`, `type_id`, `village_id`, `x`, `y`, `level`, `current_hp`) VALUES
(1, 1, 5, 15, 15, 3, 100),
(2, 2, 5, 5, 5, 1, 100),
(3, 1, 6, 15, 15, 1, 100),
(4, 2, 6, 5, 5, 1, 100),
(5, 1, 3, 1, 4, 5, 700),
(6, 1, 5, 1, 4, 1, 700);

-- --------------------------------------------------------

--
-- Структура таблицы `building_types`
--

CREATE TABLE `building_types` (
  `id` int NOT NULL,
  `type` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `hp` int NOT NULL DEFAULT '1',
  `price` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `building_types`
--

INSERT INTO `building_types` (`id`, `type`, `name`, `hp`, `price`) VALUES
(1, 'main_building', 'Ратуша', 700, 1),
(2, 'mine', 'Шахта ', 100, 1),
(3, 'barrack', 'Казарма', 500, 400),
(4, 'wall', 'Стена', 200, 100),
(5, 'shooting_tower', 'Стрелковая башня', 300, 200);

-- --------------------------------------------------------

--
-- Структура таблицы `hashes`
--

CREATE TABLE `hashes` (
  `id` int NOT NULL,
  `chat_hash` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `messages`
--

INSERT INTO `messages` (`id`, `user_id`, `message`, `created`) VALUES
(1, 1, '1234', '2025-10-10 06:55:02'),
(2, 1, '123', '2025-10-10 07:16:13'),
(3, 1, '333', '2025-10-10 07:16:15'),
(4, 5, 'хай', '2025-10-10 14:33:16'),
(5, 1, '12', '2025-10-12 17:27:17');

-- --------------------------------------------------------

--
-- Структура таблицы `units`
--

CREATE TABLE `units` (
  `id` int NOT NULL,
  `type_id` int NOT NULL,
  `village_id` int NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  `level` int NOT NULL DEFAULT '1',
  `current_hp` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `units`
--

INSERT INTO `units` (`id`, `type_id`, `village_id`, `x`, `y`, `level`, `current_hp`) VALUES
(1, 1, 5, 1, 4, 1, 100),
(2, 1, 5, 1, 4, 1, 100),
(3, 1, 5, 2, 2, 1, 100),
(4, 1, 5, 15, 4, 1, 100);

-- --------------------------------------------------------

--
-- Структура таблицы `unit_types`
--

CREATE TABLE `unit_types` (
  `id` int NOT NULL,
  `type` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `hp` int NOT NULL DEFAULT '1',
  `price` int NOT NULL,
  `damage` int DEFAULT NULL,
  `speed` decimal(3,1) DEFAULT NULL,
  `range` int DEFAULT NULL,
  `unit_type` varchar(20) DEFAULT NULL,
  `unlock_level` int DEFAULT NULL,
  `features` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `unit_types`
--

INSERT INTO `unit_types` (`id`, `type`, `name`, `hp`, `price`, `damage`, `speed`, `range`, `unit_type`, `unlock_level`, `features`) VALUES
(1, 'knight', 'Мечник', 100, 50, 15, '1.0', NULL, 'infantry', 1, '{\"type\": \"balanced\"}'),
(2, 'spearman', 'Копейщик', 60, 30, 10, '1.0', NULL, 'infantry', 1, '{\"type\": \"anti_cavalry\", \"bonus_damage\": {\"cavalry\": 0.5}, \"reach_attack\": true}'),
(3, 'berserk', 'Берсерк', 90, 120, 35, '1.3', NULL, 'infantry', 1, '{\"type\": \"anti_infantry\", \"bonus_damage\": {\"infantry\": 0.5}, \"vulnerability\": {\"archers\": 0.5}}'),
(4, 'paladin', 'Паладин', 300, 300, 25, '0.7', NULL, 'infantry', 3, '{\"type\": \"heavy_infantry\"}'),
(5, 'guardian', 'Страж', 400, 250, 12, '0.5', NULL, 'infantry', 3, '{\"type\": \"tank\", \"taunt\": true}'),
(6, 'archer', 'Лучник', 70, 60, 18, '1.0', 6, 'archer', 1, '{\"type\": \"basic_archer\"}'),
(7, 'crossbowman', 'Арбалетчик', 110, 150, 28, '0.8', 5, 'archer', 2, '{\"type\": \"armor_piercing\", \"armor_penetration\": 0.5}'),
(8, 'cavalry', 'Всадник', 130, 140, 20, '2.0', NULL, 'cavalry', 2, '{\"type\": \"scout\", \"bonus_damage\": {\"archers\": 0.5}}'),
(9, 'knight', 'Рыцарь', 180, 200, 30, '1.0', NULL, 'cavalry', 2, '{\"type\": \"armored\", \"armor_bonus\": {\"archers\": 0.2}}'),
(10, 'mage', 'Маг', 90, 220, 40, '1.0', 6, 'mage', 3, '{\"type\": \"magic_damage\", \"armor_penetration\": 0.7}'),
(11, 'summoner', 'Призыватель', 70, 180, 8, '0.9', 3, 'mage', 2, '{\"type\": \"summoner\", \"summon\": {\"type\": \"skeleton\", \"damage\": 5, \"health\": 30, \"interval\": 10}}'),
(12, 'golem', 'Голем', 500, 400, 35, '0.4', NULL, 'mage', 3, '{\"type\": \"magic_tank\", \"magic_resistance\": 0.8}');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `login` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `money` int NOT NULL DEFAULT '100'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `login`, `password`, `name`, `token`, `money`) VALUES
(1, 'DenisTest123', 'f9334e67eb51ca74f15146d2ebd61d08', 'Denissss', '8b43d607e8fe983f7783074bf076240b', 100),
(5, 'A2345688', '6866a536740d1ac4af4c89eb3d046631', '123', '7b56cc22b1324f74fc105ab2f12f4cce', 100),
(6, 'A23456888', '28754f9dc3f50b7b4be0cdd5bf2c6940', '123', NULL, 100),
(7, 'A2345678', 'd5174b43cb0ddd0ff65e49d6689684cb', '123', '8dc52f3a822ca8f0a0bdcb8c82a12937', 57),
(8, 'A23456788', 'a0af848759b6a5928cbaad779d65898f', '123', 'b5a8070af061be665aef1b59bb04b825', 100);

-- --------------------------------------------------------

--
-- Структура таблицы `villages`
--

CREATE TABLE `villages` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  `last_income_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `villages`
--

INSERT INTO `villages` (`id`, `user_id`, `x`, `y`, `last_income_datetime`) VALUES
(3, 5, 836, 654, '2025-10-10 17:31:45'),
(4, 6, 388, 245, '2025-10-10 17:34:00'),
(5, 7, 2, 814, '2025-10-10 17:46:22'),
(6, 8, 617, 700, '2025-10-10 17:47:06');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `buildings`
--
ALTER TABLE `buildings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `village_id` (`village_id`);

--
-- Индексы таблицы `building_types`
--
ALTER TABLE `building_types`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `hashes`
--
ALTER TABLE `hashes`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `village_id` (`village_id`);

--
-- Индексы таблицы `unit_types`
--
ALTER TABLE `unit_types`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login` (`login`);

--
-- Индексы таблицы `villages`
--
ALTER TABLE `villages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `buildings`
--
ALTER TABLE `buildings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `building_types`
--
ALTER TABLE `building_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `units`
--
ALTER TABLE `units`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `unit_types`
--
ALTER TABLE `unit_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `villages`
--
ALTER TABLE `villages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `buildings`
--
ALTER TABLE `buildings`
  ADD CONSTRAINT `buildings_ibfk_1` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`),
  ADD CONSTRAINT `buildings_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `building_types` (`id`);

--
-- Ограничения внешнего ключа таблицы `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Ограничения внешнего ключа таблицы `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `units_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `unit_types` (`id`),
  ADD CONSTRAINT `units_ibfk_2` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`);

--
-- Ограничения внешнего ключа таблицы `villages`
--
ALTER TABLE `villages`
  ADD CONSTRAINT `villages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
