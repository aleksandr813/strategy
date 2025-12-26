<?php

// Интервал получения дохода в секундах
const INCOME_INTERVAL = 10;

// Доход за каждый уровень здания
const INCOME_PER_LEVEL = 10;

// Максимальный уровень здания
const MAX_BUILDING_LEVEL = 3;

// Запрещенные для покупки и удаления здания
const PROHIBITED_BUILDINGS = '1,2';

// Увеличение стоимости похода за каждого юнита
const COST_PER_UNIT = 50;

const MAP_WIDTH = 89;
const MAP_HEIGHT = 27;

// Время по истечении которого, если игрок не посылал запрос, то он считается офлайн
const ONLINE_TIMEOUT = 30;