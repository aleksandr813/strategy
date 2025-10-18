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
}

// Тип для использования в приложении (числовые поля)
export interface BuildingType {
    id: number;
    type: string;
    name: string;
    hp: number;
    price: number;
}

// Тип для ответа метода getBuildingTypes
export type TBuildingTypesResponse = {
    building_types: BuildingTypeResponse[];
}

export interface buyBuildingResponse {
    id: string;
    type: string;
    name: string;
    hp: string;
    price: string;
}