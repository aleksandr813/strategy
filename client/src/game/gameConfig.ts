export type TPoint = {
    x: number;
    y: number;
}

export enum EDIRECTION {
    LEFT = 'left',
    RIGHT = 'right',
    UP = 'up',
    DOWN = 'down',
};

export type TWINDOW = {
    LEFT: number;
    TOP: number;
    HEIGHT: number;
    WIDTH: number;
}

export enum UnitTypeID {
    Swordman = 1,
    Spearman = 2,
    Berserk = 3,
    Paladin = 4,
    Guardian = 5,
    Archer = 6,
    Crossbowman = 7,
    Knight = 9,
    Sorcerer = 10,
    Summoner = 11,
    Golem = 12,
}

type SpriteMap = {
    [K in UnitTypeID]: number[];
};

export const SPRITE_MAP: SpriteMap = {
        [UnitTypeID.Knight]: [21],
        [UnitTypeID.Spearman]: [22],
        [UnitTypeID.Berserk]: [30],
        [UnitTypeID.Paladin]: [31],
        [UnitTypeID.Guardian]: [29],
        [UnitTypeID.Archer]: [24],
        [UnitTypeID.Crossbowman]: [23],
        [UnitTypeID.Sorcerer]: [25],
        [UnitTypeID.Summoner]: [27],
        [UnitTypeID.Golem]: [26],
        [UnitTypeID.Swordman]: [28]
};

export function getUnitSprites(typeId: UnitTypeID): number[] {
    return SPRITE_MAP[typeId] ?? SPRITE_MAP[UnitTypeID.Swordman];
}


const GAMECONFIG = {
    CHAT_TIMESTAMP: 200, //ms

    SPRITE_SIZE: 64, // размер спрайта в пикселях
    LINE_OF_SPRITES: 20, // количество спрайтов в карте спрайтов
    WIDTH: 50, // ширина карты
    HEIGHT: 32, // высота карты 
    // игровое окно, видимое пользователю
    WINDOW: {
        LEFT: 0,
        TOP: 0,
        HEIGHT: 10,
        WIDTH: 20,
    },

    EXCLUDED_BUILDINGS: ['main_building', 'mine'],
};

export default GAMECONFIG;