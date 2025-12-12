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
    [UnitTypeID.Knight]: [21, 61],
    [UnitTypeID.Spearman]: [22, 62],
    [UnitTypeID.Berserk]: [30, 70],
    [UnitTypeID.Paladin]: [31],
    [UnitTypeID.Guardian]: [29, 69],
    [UnitTypeID.Archer]: [24, 64],
    [UnitTypeID.Crossbowman]: [23, 63],
    [UnitTypeID.Sorcerer]: [25],
    [UnitTypeID.Summoner]: [27],
    [UnitTypeID.Golem]: [26],
    [UnitTypeID.Swordman]: [28]
};

export function getUnitSprites(typeId: UnitTypeID): number[] {
    return SPRITE_MAP[typeId] ?? SPRITE_MAP[UnitTypeID.Swordman];
}


const GAMECONFIG = {
    EXCLUDED_BUILDINGS: ['Ратуша', 'Шахта'],


    MIN_ZOOM: 1,
    MAX_ZOOM: 45,
    ZOOM_FACTOR: 0.1,

    GRID_WIDTH: 87,
    GRID_HEIGHT: 29,
    MOVE_INTERVAL: 100,
    INCOME_INTERVAL: 5000,
    MAP_UPDATE_INTERVAL: 15000,
};


export default GAMECONFIG;