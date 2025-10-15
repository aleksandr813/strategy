// Server.ts

import md5 from 'md5';
import CONFIG from "../../config";
import Store from "../store/Store";
import { BuildingTypeResponse, TBuildingTypesResponse } from './types';
import { TAnswer, TError, TMessagesResponse, TUser } from "./types";

const { CHAT_TIMESTAMP, HOST } = CONFIG;

export type TBuildingFullData = {
    id: number;
    x: number;
    y: number;
    current_hp: number;
    max_hp: number; 
    type: string;
    type_id: string;   
};

export type TBuildingsResponse = {
    buildings: TBuildingFullData[];
}

class Server {
    HOST = HOST;
    store: Store;
    chatInterval: NodeJS.Timer | null = null;
    showErrorCb: (error: TError) => void = () => {};

    constructor(store: Store) {
        this.store = store;
    }

    private async request<T>(method: string, params: { [key: string]: string } = {}): Promise<T | null> {
        try {
            params.method = method;
            const token = this.store.getToken();
            if (token) {
                params.token = token;
            }
            const response = await fetch(`${this.HOST}/?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`);
            const answer: TAnswer<T> = await response.json();
            if (answer.result === 'ok' && answer.data) {
                return answer.data;
            }
            answer.error && this.setError(answer.error);
            return null;
        } catch (e) {
            console.log(e);
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
    
    async getBuildings(): Promise<TBuildingsResponse | null> {
        return await this.request<TBuildingsResponse>('getBuildings');
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
        
        const paramNames = ['a', 'b', 'c', 'd', 'e'];
        coeffs.forEach((coeff, index) => {
            if (index < paramNames.length) {
                params[paramNames[index]] = coeff.toString();
            }
        });
        
        return await this.request<any>('getRoots', params);
    }
}

export default Server;