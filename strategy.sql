-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Дек 07 2025 г., 11:04
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
-- Структура таблицы `army`
--

CREATE TABLE `army` (
  `army` int NOT NULL,
  `userId` int NOT NULL,
  `startX` int NOT NULL,
  `startY` int NOT NULL,
  `startTime` datetime NOT NULL,
  `arrivalTime` datetime NOT NULL,
  `targetX` int NOT NULL,
  `targetY` int NOT NULL,
  `attackId` int NOT NULL,
  `units` text NOT NULL,
  `speed` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `army`
--

INSERT INTO `army` (`army`, `userId`, `startX`, `startY`, `startTime`, `arrivalTime`, `targetX`, `targetY`, `attackId`, `units`, `speed`) VALUES
(25, 9, 496, 410, '2025-11-29 20:50:16', '2025-11-29 21:07:42', 836, 654, 5, '5,6,11', 0.4),
(26, 9, 496, 410, '2025-11-29 21:20:21', '2025-11-29 21:37:47', 836, 654, 5, '5,6,11', 0.4),
(27, 9, 496, 410, '2025-11-29 21:20:51', '2025-11-29 21:38:17', 836, 654, 5, '5,6,11', 0.4),
(28, 9, 496, 410, '2025-11-29 21:32:05', '2025-11-29 21:49:31', 836, 654, 5, '5,6,11', 0.4),
(29, 9, 496, 410, '2025-11-30 17:10:08', '2025-11-30 17:27:34', 836, 654, 5, '5,6,11', 0.4),
(30, 9, 496, 410, '2025-12-01 17:17:30', '2025-12-01 17:34:56', 836, 654, 5, '5,6,11', 0.4),
(31, 9, 496, 410, '2025-12-01 18:06:33', '2025-12-01 18:23:59', 836, 654, 5, '5,6,11', 0.4),
(32, 9, 496, 410, '2025-12-01 19:20:03', '2025-12-01 19:37:29', 836, 654, 5, '5,6,11', 0.4),
(33, 9, 496, 410, '2025-12-01 21:20:29', '2025-12-01 21:37:55', 836, 654, 5, '5,6,11', 0.4),
(34, 9, 496, 410, '2025-12-01 22:44:12', '2025-12-01 23:01:38', 836, 654, 5, '5,6,11', 0.4),
(35, 9, 496, 410, '2025-12-03 17:15:27', '2025-12-03 17:32:53', 836, 654, 5, '5,6,11', 0.4),
(36, 12, 67, 19, '2025-12-03 18:41:22', '2025-12-03 19:14:36', 2, 814, 7, '32,33', 0.4),
(37, 12, 67, 19, '2025-12-03 19:07:47', '2025-12-03 19:41:01', 2, 814, 7, '32,33', 0.4),
(38, 12, 67, 19, '2025-12-03 19:56:14', '2025-12-03 20:29:28', 2, 814, 7, '32,33', 0.4),
(39, 12, 67, 19, '2025-12-05 17:19:47', '2025-12-05 17:53:01', 2, 814, 7, '32,33', 0.4),
(40, 12, 67, 19, '2025-12-06 18:51:24', '2025-12-06 19:24:38', 2, 814, 7, '32,33', 0.4);

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
(6, 1, 5, 1, 4, 1, 700),
(7, 1, 7, 15, 15, 1, 100),
(8, 2, 7, 5, 5, 1, 100),
(9, 1, 8, 15, 15, 2, 100),
(10, 2, 8, 5, 5, 1, 100),
(11, 3, 8, 21, 15, 2, 500),
(12, 5, 8, 42, 13, 3, 300),
(17, 1, 9, 15, 15, 1, 100),
(18, 2, 9, 5, 5, 1, 100),
(19, 3, 9, 6, 14, 1, 500),
(21, 1, 10, 15, 15, 1, 100),
(22, 2, 10, 5, 5, 1, 100),
(23, 1, 11, 15, 15, 1, 100),
(24, 2, 11, 5, 5, 1, 100),
(26, 4, 11, 33, 15, 1, 200),
(27, 4, 11, 33, 16, 1, 200),
(28, 4, 11, 32, 15, 1, 200),
(29, 4, 11, 34, 15, 1, 200),
(30, 4, 11, 33, 14, 1, 200),
(31, 4, 11, 35, 15, 1, 200),
(32, 4, 11, 35, 16, 1, 200),
(33, 4, 11, 33, 17, 1, 200),
(34, 4, 11, 32, 17, 1, 200),
(35, 4, 11, 31, 15, 1, 200),
(36, 4, 11, 31, 14, 1, 200),
(37, 4, 11, 31, 13, 1, 200),
(38, 4, 11, 33, 13, 1, 200),
(39, 4, 11, 34, 13, 1, 200),
(40, 4, 11, 35, 13, 1, 200),
(41, 4, 11, 35, 17, 1, 200),
(42, 4, 11, 31, 17, 1, 200),
(43, 5, 11, 23, 12, 1, 300);

-- --------------------------------------------------------

--
-- Структура таблицы `building_types`
--

CREATE TABLE `building_types` (
  `id` int NOT NULL,
  `type` varchar(100) NOT NULL,
  `hp` int NOT NULL DEFAULT '1',
  `price` int NOT NULL,
  `unlock_level` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `building_types`
--

INSERT INTO `building_types` (`id`, `type`, `hp`, `price`, `unlock_level`) VALUES
(1, 'Ратуша', 700, 1, 1),
(2, 'Шахта', 100, 1, 1),
(3, 'Казармы', 500, 400, 1),
(4, 'Стены', 200, 100, 1),
(5, 'Стрелковая башня', 300, 200, 1);

-- --------------------------------------------------------

--
-- Структура таблицы `game`
--

CREATE TABLE `game` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `game`
--

INSERT INTO `game` (`id`, `name`, `value`) VALUES
(1, 'main_building_price', '100'),
(2, 'main_builind_hp', '700'),
(3, 'mine_price', '100'),
(4, 'mine_hp', '100'),
(5, 'swordsman_price', '50'),
(6, 'swordsman_hp', '100'),
(7, 'swordsman_damage', '15'),
(8, 'swordsman_speed', '1.0'),
(9, 'spearman_hp', '60'),
(10, 'spearman_price', '30'),
(11, 'spearman_damage', '10'),
(12, 'spearman_speed', '1.0'),
(13, 'berserk_hp', '90'),
(14, 'berserk_price', '120'),
(15, 'berserk_damage', '35'),
(16, 'berserk_speed', '1.3'),
(17, 'paladin_hp', '300'),
(18, 'paladin_price', '300'),
(19, 'paladin_damage', '25'),
(20, 'paladin_speed', '0.7'),
(21, 'guardian_hp', '400'),
(22, 'guardian_price', '250'),
(23, 'guardian_damage', '12'),
(24, 'guardian_speed', '0.5'),
(25, 'archer_hp', '70'),
(26, 'archer_price', '60'),
(27, 'archer_damage', '18'),
(28, 'archer_speed', '1.0'),
(29, 'archer_range', '6'),
(30, 'crossbowman_hp', '110'),
(31, 'crossbowman_price', '150'),
(32, 'crossbowman_damage', '28'),
(33, 'crossbowman_speed', '0.8'),
(34, 'crossbowman_range', '5'),
(35, 'cavalry_hp', '130'),
(36, 'cavalry_price', '140'),
(37, 'cavalry_damage', '20'),
(38, 'cavalry_speed', '2.0'),
(39, 'knight_hp', '180'),
(40, 'knight_price', '200'),
(41, 'knight_damage', '30'),
(42, 'knight_speed', '1.0'),
(43, 'mage_hp', '90'),
(44, 'mage_price', '220'),
(45, 'mage_damage', '40'),
(46, 'mage_speed', '1.0'),
(47, 'mage_range', '6'),
(48, 'summoner_hp', '70'),
(49, 'summoner_price', '180'),
(50, 'summoner_damage', '8'),
(51, 'summoner_speed', '0.9'),
(52, 'summoner_range', '3'),
(53, 'golem_hp', '500'),
(54, 'golem_price', '400'),
(55, 'golem_damage', '35'),
(56, 'golem_speed', '0.4'),
(57, 'barrak_hp', '500'),
(58, 'barrak_price', '400'),
(59, 'wall_hp', '200'),
(60, 'wall_price', '100'),
(61, 'shooting_tower_hp', '300'),
(62, 'shooting_tower_price', '200');

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
-- Структура таблицы `map_hashes`
--

CREATE TABLE `map_hashes` (
  `id` int NOT NULL,
  `hash` text NOT NULL
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
(4, 5, 'хай', '2025-10-10 14:33:16');

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
  `current_hp` int NOT NULL,
  `on_a_crusade` tinyint(1) NOT NULL DEFAULT '0',
  `is_enemy` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `units`
--

INSERT INTO `units` (`id`, `type_id`, `village_id`, `x`, `y`, `level`, `current_hp`, `on_a_crusade`, `is_enemy`) VALUES
(1, 1, 5, 1, 4, 1, 100, 0, 0),
(2, 1, 5, 1, 4, 1, 100, 0, 0),
(3, 1, 5, 2, 2, 1, 100, 0, 0),
(5, 1, 7, 8, 2, 1, 100, 1, 0),
(6, 2, 7, 9, 3, 1, 60, 1, 0),
(7, 3, 7, 6, 4, 1, 90, 1, 0),
(8, 5, 7, 10, 3, 1, 400, 1, 0),
(9, 5, 7, 10, 4, 1, 400, 1, 0),
(10, 5, 7, 4, 4, 1, 400, 1, 0),
(11, 11, 7, 5, 4, 1, 500, 1, 0),
(12, 11, 8, 37, 25, 1, 500, 0, 0),
(13, 11, 8, 37, 27, 1, 500, 0, 0),
(14, 1, 8, 36, 21, 1, 100, 0, 0),
(15, 10, 8, 35, 15, 1, 90, 0, 0),
(16, 4, 8, 36, 15, 1, 300, 0, 0),
(17, 5, 8, 34, 25, 1, 400, 0, 0),
(18, 8, 8, 38, 15, 1, 130, 0, 0),
(19, 3, 8, 35, 24, 1, 90, 0, 0),
(20, 2, 8, 36, 23, 1, 60, 0, 0),
(21, 6, 8, 38, 16, 1, 70, 0, 0),
(22, 7, 8, 37, 26, 1, 110, 0, 0),
(23, 10, 8, 34, 22, 1, 90, 0, 0),
(24, 1, 8, 49, 15, 1, 100, 0, 0),
(25, 7, 8, 47, 20, 1, 110, 0, 0),
(26, 3, 9, 28, 18, 1, 90, 0, 0),
(27, 3, 9, 31, 19, 1, 90, 0, 0),
(28, 3, 9, 30, 13, 1, 90, 0, 0),
(29, 3, 9, 32, 16, 1, 90, 0, 0),
(30, 2, 9, 29, 16, 1, 60, 0, 0),
(31, 1, 9, 27, 16, 1, 100, 0, 0),
(32, 11, 10, 3, 4, 1, 500, 1, 0),
(33, 11, 10, 2, 7, 1, 500, 1, 0),
(34, 8, 11, 23, 9, 1, 130, 0, 0),
(35, 11, 11, 22, 9, 1, 500, 0, 0),
(36, 10, 11, 38, 15, 1, 90, 0, 0),
(37, 1, 11, 23, 10, 1, 100, 0, 0),
(38, 3, 11, 24, 10, 1, 90, 0, 0),
(39, 11, 10, 5, 7, 1, 500, 0, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `unit_types`
--

CREATE TABLE `unit_types` (
  `id` int NOT NULL,
  `type` varchar(100) NOT NULL,
  `hp` int NOT NULL DEFAULT '1',
  `price` int NOT NULL,
  `damage` int DEFAULT NULL,
  `speed` decimal(3,1) DEFAULT NULL,
  `range` int DEFAULT NULL,
  `unit_type` varchar(20) DEFAULT NULL,
  `unlock_level` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `unit_types`
--

INSERT INTO `unit_types` (`id`, `type`, `hp`, `price`, `damage`, `speed`, `range`, `unit_type`, `unlock_level`) VALUES
(1, 'Мечник', 100, 50, 15, '1.0', NULL, 'infantry', 1),
(2, 'Копейщик', 60, 30, 10, '1.0', NULL, 'infantry', 1),
(3, 'Берсерк', 90, 120, 35, '1.3', NULL, 'infantry', 1),
(4, 'Паладин', 300, 300, 25, '0.7', NULL, 'infantry', 3),
(5, 'Страж', 400, 250, 12, '0.5', NULL, 'infantry', 3),
(6, 'Лучник', 70, 60, 18, '1.0', 6, 'archer', 1),
(7, 'Арбалетчик', 110, 150, 28, '0.8', 5, 'archer', 2),
(8, 'Всадник', 130, 140, 20, '2.0', NULL, 'cavalry', 2),
(9, 'Рыцарь', 180, 200, 30, '1.0', NULL, 'cavalry', 2),
(10, 'Маг', 90, 220, 40, '1.0', 6, 'mage', 3),
(11, 'Голем', 500, 400, 35, '0.4', NULL, 'mage', 3);

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
(5, 'A2345688', '6866a536740d1ac4af4c89eb3d046631', '123', '7b56cc22b1324f74fc105ab2f12f4cce', 100),
(7, 'A2345678', 'd5174b43cb0ddd0ff65e49d6689684cb', '123', '8dc52f3a822ca8f0a0bdcb8c82a12937', 36),
(8, 'A23456788', 'a0af848759b6a5928cbaad779d65898f', '123', 'b5a8070af061be665aef1b59bb04b825', 100),
(9, 'admin', 'f6fdffe48c908deb0f4c3bd36c032e72', 'admin', '412d50d375e2bac96d72f5eab24ec32f', 997679),
(10, 'newGamer', '818033cf98e87e246aa380ddf7aa6d95', 'Gamer', '7d5c378f5547a79ab0cbfd35374b3257', 1108),
(11, 'player', 'a4214e8619929f63e6db170c2251602d', '1', '5a682cf5834282dbff0dc1587c4b6eea', 360),
(12, 'PlayerOne', '092854f714a23d8d87c82403a773a142', 'PlayerOne', '3f3d2ee81a99835846acd32f6f4ae5bd', 300),
(13, 'Pasha', '0dd1f49b0f7a77776fcbaf56e9b7a4ce', 'Pavel', 'f128e3fda5986dd9594c7e2f55f05aac', 6269);

-- --------------------------------------------------------

--
-- Структура таблицы `villages`
--

CREATE TABLE `villages` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  `last_income_datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `attack_id` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `villages`
--

INSERT INTO `villages` (`id`, `user_id`, `x`, `y`, `last_income_datetime`, `attack_id`) VALUES
(3, 5, 836, 654, '2025-10-10 17:31:45', 0),
(5, 7, 2, 814, '2025-10-10 17:46:22', 0),
(6, 8, 617, 700, '2025-10-10 17:47:06', 0),
(7, 9, 496, 410, '2025-11-29 20:58:50', 0);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `army`
--
ALTER TABLE `army`
  ADD PRIMARY KEY (`army`),
  ADD KEY `userId` (`userId`);

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
-- Индексы таблицы `game`
--
ALTER TABLE `game`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `hashes`
--
ALTER TABLE `hashes`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `map_hashes`
--
ALTER TABLE `map_hashes`
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
-- AUTO_INCREMENT для таблицы `army`
--
ALTER TABLE `army`
  MODIFY `army` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT для таблицы `buildings`
--
ALTER TABLE `buildings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT для таблицы `building_types`
--
ALTER TABLE `building_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `game`
--
ALTER TABLE `game`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT для таблицы `map_hashes`
--
ALTER TABLE `map_hashes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `units`
--
ALTER TABLE `units`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT для таблицы `unit_types`
--
ALTER TABLE `unit_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT для таблицы `villages`
--
ALTER TABLE `villages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `army`
--
ALTER TABLE `army`
  ADD CONSTRAINT `army_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `buildings`
--
ALTER TABLE `buildings`
  ADD CONSTRAINT `buildings_ibfk_1` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`),
  ADD CONSTRAINT `buildings_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `building_types` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
