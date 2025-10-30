import md5 from 'md5';
import CONFIG from "../../config";
import Store from "../store/Store";
import { BuildingTypeResponse, TBuildingTypesResponse, TBuildingResponse } from './types';
import { UnitTypeResponse, TUnitTypesResponse, TUnitResponse } from './types';
import { TAnswer, TError, TMessagesResponse, TUser } from "./types";

const { CHAT_TIMESTAMP, HOST } = CONFIG;

class Server {
    HOST = HOST;
    store: Store;
    chatInterval: NodeJS.Timer | null = null;
    showErrorCb: (error: TError) => void = () => {};

    constructor(store: Store) {
        this.store = store;
    }

    // посылает запрос и обрабатывает ответ
    private async request<T>(method: string, params: { [key: string]: string } = {}): Promise<T | null> {
        try {
            params.method = method;
            const token = this.store.getToken();
            if (token) {
                params.token = token;
            }
            const url = `${this.HOST}/?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`;

            console.log('REQUEST URL:', url);
            
            
            const response = await fetch(url);
            const answer: TAnswer<T> = await response.json();
            
            console.log('Server response:', answer);
            
            if (answer.result === 'ok' && answer.data) {
                return answer.data;
            }
            answer.error && this.setError(answer.error);
            
            if (answer.error) {
                console.error('Server error:', answer.error);
            }
            
            return null;
        } catch (e) {
            console.log('Request exception:', e);
            this.setError({
                code: 9000,
                text: 'Unknown error',
            });
            return null;
        }
    }

    private setError(error: TError): void {
        this.showErrorCb(error);
    }

    showError(cb: (error: TError) => void) {
        this.showErrorCb = cb;
    }

    async login(login: string, password: string): Promise<boolean> {
        const rnd = Math.round(Math.random() * 100000);
        const hash = md5(`${md5(`${login}${password}`)}${rnd}`);
        const user = await this.request<TUser>('login', { login, hash, rnd: `${rnd}` });
        if (user) {
            this.store.setUser(user);
            return true;
        }
        return false;
    }

    async logout() {
        const result = await this.request<boolean>('logout');
        if (result) {
            this.store.clearUser();
        }
    }

    registration(login: string, password: string, name: string): Promise<boolean | null> {
        const hash = md5(`${login}${password}`);
        return this.request<boolean>('registration', { login, hash, name });
    }

    sendMessage(message: string): void {
        this.request<boolean>('sendMessage', { message });
    }

    async getMessages(): Promise<TMessagesResponse | null> {
        const hash = this.store.getChatHash();
        const result = await this.request<TMessagesResponse>('getMessages', { hash });
        if (result) {
            this.store.setChatHash(result.hash);
            return result;
        }
        return null;
    }

    startChatMessages(cb: (hash: string) => void): void {
        this.chatInterval = setInterval(async () => {
            const result = await this.getMessages();
            if (result) {
                const { messages, hash } = result;
                this.store.addMessages(messages);
                cb(hash);
            }
        }, CHAT_TIMESTAMP);

    }

    stopChatMessages(): void {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
            this.store.clearMessages();
        }
    }

    async getRoots(coeffs: number[]): Promise<any> {
        const params: { [key: string]: string } = { method: 'getRoots' };
        
        // Создаем параметры a, b, c, d, e
        const paramNames = ['a', 'b', 'c', 'd', 'e'];
        coeffs.forEach((coeff, index) => {
            if (index < paramNames.length) {
                params[paramNames[index]] = coeff.toString();
            }
        });
        
        return await this.request<any>('getRoots', params);
    }

    async getBuildings(): Promise<TBuildingResponse> {
        const response = await this.request<TBuildingResponse>('getBuildings');
        if (!response) {
            return { buildings: [] };
        }
        return response;
    }

    async getBuildingTypes(): Promise<TBuildingTypesResponse> {
        const response = await this.request<TBuildingTypesResponse>('getBuildingTypes');
        if (!response) {
            return { building_types: [] };
        }
        return response;
    }

    async deleteBuilding(buildingId: number, villageId: number): Promise<boolean> {
        const response = await this.request<any>('deleteBuilding',{
            buildingId: buildingId.toString(),
            villageId: villageId.toString()
        });
        return response === true;
    }

    async getUnits(): Promise<TUnitResponse> {
        const response = await this.request<TUnitResponse>('getUnits');
        if (!response) {
            return { units: [] };
        }
        return response;
    }

    async getUnitsTypes(): Promise<TUnitTypesResponse> {
        const response = await this.request<TUnitTypesResponse>('getUnitTypes');
        if (!response) {
            return { unit_types: [] };
        }
        return response;
    }

    async buyBuilding(typeId: number, x: number, y: number): Promise<any> {
        console.log('buyBuilding called with:', { typeId, x, y });
        const result = await this.request<any>('buyBuilding', { 
            typeId: typeId.toString(), 
            x: x.toString(), 
            y: y.toString() 
        });
        console.log('buyBuilding result:', result);
        return result;
    }
}


export default Server;