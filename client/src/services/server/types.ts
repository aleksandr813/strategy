export type TError = {
    code: number;
    text: string;
}

export type TRootsResponse = {
    roots?: number[];
    error?: TError;
}

export type TAnswer<T> = {
    result: 'ok' | 'error';
    data?: T;
    error?: TError;
}

export type TUser = {
    token: string;
    name: string;
}

export type TMessage = {
    message: string;
    author: string;
    created: string;
}

export type TMessages = TMessage[];

export interface TMessagesResponse {
    messages: TMessages;
    hash: string;
}


export type TBuildingType = {
    id: number;
    type: string;
    hp: number;
    hpLevel1: number;
    hpLevel2: number;
    hpLevel3: number;
    price?: number;
    priceLevel1: number;
    priceLevel2: number;
    priceLevel3: number;
    damageLevel1: number;
    damageLevel2: number;
    damageLevel3: number;
    rangeAttackLevel1: number;
    rangeAttackLevel2: number;
    rangeAttackLevel3: number;
    sprite: number;
    unlockLevel: number;
}


export type TBuilding = {
    id: number;
    typeId: number;
    villageId: number;
    x: number;
    y: number;
    currentHp: number;
    level: number;
    type: string;
    unlockLevel: number;
}

export enum BuildingTypeID {
    TownHall = 1, // Ратуша
    Mine = 2,     // Шахта
    Kazarma = 3,
    Wall = 4,
    Tower = 5,
    Gates = 6
}

export type TUnitType = {
    id: number;
    type: string;
    hp: number;
    price: number;
    unlockLevel: number;
}

export type TUnit = {
    id: number;
    typeId: number;
    villageId: number;
    x: number;
    y: number;
    level: number;
    currentHp: number;
    type: string;
    unlockLevel: number;
    isEnemy: number;
    onACrusade: number;

}

export type TVillage = {
    id: number;
    userId: number;
    x: number;
    y: number;
    name: string;
}

export type TArmy = {
    arrivalTime: number;
    attackId: number;
    currentX: number;
    currentY: number;
    id: number;
    speed: number;
    startTime: string;
    targetX: number;
    targetY: number;
    units: number[];
    userId: number;
}

export type TMap = {
    armies: TArmy[];
    villages: TVillage[];
}

export type TMapResponse = {
    hash: string;
    mapData: TMap;
}

export type TUserArmy = {
    armyId: number;
    units: number[];
    attackId: number;
    enemyName: string;
    speed: number;
}

export type TBattle = {
    hash: string;
    
}
