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
    sprite_id:string;
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
    building_types: BuildingTypeResponse[];
}

export interface BuildingResponse { 
    id: string;
    type_id: string;
    village_id: string;
    x: string;
    y: string;  
    current_hp: string;
    level: string;
}

// Тип для использования в приложении (числовые поля)
export interface Building {
    id: number;
    type_id: number;
    village_id: number;
    x: number;
    y: number;
    current_hp: number;
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

export interface buyBuildingResponse {
    id: string;
    type: string;
    name: string;
    hp: string;
    price: string;
}

