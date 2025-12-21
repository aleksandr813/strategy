export enum UnitTypeID {
    Swordman = 1,
    Spearman = 2,
    Berserk = 3,
    Paladin = 4,
    Guardian = 5,
    Archer = 6,
    Crossbowman = 7,
    Knight = 8,
    Sorcerer = 9,
    Golem = 10,
}

type SpriteMap = {
    [K in UnitTypeID]: number[];
};

export const SPRITE_MAP: SpriteMap = {
    [UnitTypeID.Swordman]: [68, 88],
    [UnitTypeID.Spearman]: [42, 62],
    [UnitTypeID.Berserk]: [50, 70],
    [UnitTypeID.Paladin]: [51, 71],
    [UnitTypeID.Guardian]: [49, 69],
    [UnitTypeID.Archer]: [44, 64],
    [UnitTypeID.Crossbowman]: [43, 63],
    [UnitTypeID.Knight]: [41, 61],
    [UnitTypeID.Sorcerer]: [45],
    [UnitTypeID.Golem]: [46],    
};

export function getUnitSprites(typeId: UnitTypeID): number[] {
    return SPRITE_MAP[typeId] ?? SPRITE_MAP[UnitTypeID.Swordman];
}


const GAMECONFIG = {
    EXCLUDED_BUILDINGS: ['Ратуша', 'Шахта'],


    MIN_ZOOM: 1,
    MAX_ZOOM: 45,
    ZOOM_FACTOR: 0.1,

    BORDER_PADDING: 2,

    GRID_WIDTH: 87,
    GRID_HEIGHT: 29,
    MOVE_INTERVAL: 100,
    INCOME_INTERVAL: 5000,
    MAP_UPDATE_INTERVAL: 2000,
};


export default GAMECONFIG;