export type TError = {
    code: number;
    text: string;
}

export type TRootsResponse = {
    roots?: number[];
    error?: TError;
};

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
export type TMessagesResponse = {
    messages: TMessages;
    hash: string;
}

// Тип для ответа с сервера (строковые поля)
export interface BuildingTypeResponse {
    id: string;
    type: string;
    name: string;
    hp: string;
    price: string;
    spriteId:string;
}

// Тип для использования в приложении (числовые поля)
export interface BuildingType {
    id: number;
    type: string;
    name: string;
    hp: number;
    price: number;
    sprite: number;
}

// Тип для ответа метода getBuildingTypes
export type TBuildingTypesResponse = {
    buildingTypes: BuildingTypeResponse[];
}

export interface BuildingResponse { 
    id: string;
    typeId: string;
    villageId: string;
    x: string;
    y: string;  
    currentHp: string;
    level: string;
}

// Тип для использования в приложении (числовые поля)
export interface Building {
    id: number;
    typeId: number;
    villageId: number;
    x: number;
    y: number;
    currentHp: number;
    level: number;
}

export enum BuildingTypeID {
    TownHall = 1, // Ратуша
    Mine = 2,     // Шахта
}

// Тип для ответа метода getBuildingTypes
export type TBuildingResponse = {
    buildings: BuildingResponse[];
}


export interface UnitTypeResponse {
    id: string;
    type: string;
    name: string;
    hp: string;
    price: string;
}

// Тип для использования в приложении (числовые поля)
export interface UnitType {
    id: number;
    type: string;
    name: string;
    hp: number;
    price: number;
}

export type TUnitTypesResponse = {
    unitTypes: UnitTypeResponse[];
}

export interface UnitResponse { 
    id: string;
    typeId: string;
    villageId: string;
    x: string;
    y: string;
    level: string;  
    currentHp: string;
}

// Тип для использования в приложении (числовые поля)
export interface Unit {
    id: number;
    typeId: number;
    villageId: number;
    x: number;
    y: number;
    level: number;
    currentHp: number;
}

export enum UnitTypeID {
    Knight = 1, // Рыцарь
}

// Тип для ответа метода getBuildingTypes
export type TUnitResponse = {
    units: UnitResponse[];
}

export interface buyBuildingResponse {
    id: string;
    type: string;
    name: string;
    hp: string;
    price: string;
}

