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
    name: string;
    hp: number;
    price: number;
    sprite: number;
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
}

export enum BuildingTypeID {
    TownHall = 1, // Ратуша
    Mine = 2,     // Шахта
    Kazarma = 3,
    Wall = 4,
    Tower = 5,
}

export type TUnitType = {
    id: number;
    type: string;
    name: string;
    hp: number;
    price: number;
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

export type TMoveUnitRequest = {
    unitId: number;
    x: number;
    y: number;
};

export interface TUnitsResponse {
    units: TUnit[];
}

export interface BuyBuildingResponse {
    id: string;
    type: string;
    name: string;
    hp: string;
    price: string;
}