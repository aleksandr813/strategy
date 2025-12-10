import md5 from 'md5';
import GAMECONFIG from '../../game/gameConfig';
import CONFIG from '../../config';
import Store from "../store/Store";
import { TBuildingType, TBuilding, TMap, TMapResponse, TUserArmy } from './types';
import { TUnitType, TUnit } from './types';
import { TAnswer, TError, TMessagesResponse, TUser } from "./types";
import Unit from '../../game/entities/Unit';

const { HOST, CHAT_TIMESTAMP } = CONFIG;

class Server {
    HOST = HOST;
    store: Store;
    chatInterval: NodeJS.Timer | null = null;
    showErrorCb: (error: TError) => void = () => { };

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

            const response = await fetch(url);
            const answer: TAnswer<T> = await response.json();

            //console.log('Server response:', answer);

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

    async registration(login: string, password: string, name: string): Promise<boolean> {
        const hash = md5(`${login}${password}`);
        const user = await this.request<TUser>('registration', { login, hash, name });
        if (user) {
            this.store.setUser(user);
            return true;
        }
        return false;
    }

    async logout(token: string) {
        const result = await this.request<boolean>('logout', { token });
        if (result) {
            this.store.clearUser();
            return true;
        }
        return false;
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

    async getBuildings(): Promise<TBuilding[] | null> {
        const response = await this.request<TBuilding[]>('getBuildings');
        if (!response) {
            return null;
        }

        console.log('Buildings from server:', response);
        return response;
    }

    async getBuildingTypes(): Promise<TBuildingType[]> {
        const response = await this.request<TBuildingType[]>('getBuildingTypes');
        if (!response) {
            return [];
        }
        return response;
    }

    async getUnits(): Promise<TUnit[] | null> {
        const response = await this.request<any[]>('getUnits');
        if (!response) {
            return null;
        }

        const units: TUnit[] = response.map(unit => ({
            id: Number(unit.id),
            typeId: Number(unit.typeId),
            villageId: Number(unit.villageId),
            x: Number(unit.x),
            y: Number(unit.y),
            level: Number(unit.level),
            currentHp: Number(unit.currentHp),
            type: unit.type,
            unlockLevel: unit.unlockLevel,
            isEnemy: unit.isEnemy
        }));

        console.log('Units from server:', units);
        return units;
    }

    async getUnitsTypes(): Promise<TUnitType[]> {
        const response = await this.request<TUnitType[]>('getUnitTypes');
        if (!response) {
            return [];
        }
        console.log(response);
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

    async buyUnit(typeId: number, x: number, y: number): Promise<number | null> {
        console.log('buyUnit called with', { typeId, x, y });
        const result = await this.request<number>('buyUnit', {
            typeId: typeId.toString(),
            x: x.toString(),
            y: y.toString()
        });
        console.log('buyUnit result:', result);
        return result;
    }

    async deleteBuilding(buildingId: number): Promise<boolean | null> {
        const response = await this.request<boolean>('deleteBuilding', {
            id: buildingId.toString(),
        });
        return response;
    }

    async upgradeBuilding(buildingId: number, typeId: number): Promise<boolean | null> {
        const response = await this.request<boolean>('upgradeBuilding', {
            id: buildingId.toString(),
            typeId: typeId.toString()
        });
        return response || null;
    }

    async moveUnits(units: Unit[]): Promise<boolean> {
        const unitsForMove = units.map(unit => ({
            id: unit.id,
            x: unit.coords.x,
            y: unit.coords.y,
        }));

        const params: { [key: string]: string } = {};
        
        unitsForMove.forEach((unit, index) => {
            params[`units[${index}][unitId]`] = unit.id.toString();
            params[`units[${index}][x]`] = unit.x.toString();
            params[`units[${index}][y]`] = unit.y.toString();
        });

        const response = await this.request<boolean>('moveUnits', params);

        return response !== null ? response : false;
    }

    async getIncome(): Promise<void> {
        //console.log('getIncome called');
        const result = await this.request<{ money: number }>('getIncome');
        //console.log('getIncome result:', result);
        
        if (result && typeof result === 'object' && 'money' in result) {
            this.store.setMoney(result.money);
        }
    }

    async getMap(): Promise<TMapResponse | null> {
        const hash = this.store.getMapHash();
        const map = this.request<TMapResponse>('getMap', { hash })
        return map
    }

    async getUserArmies(): Promise<TUserArmy[] | null> {
        const userArmies = this.request<TUserArmy[]>('getUserArmies')
        return userArmies;
    }

    async moveArmyBack(armyId: number): Promise<boolean> {

        const result = this.request<boolean>('moveArmyBack', { armyId.toString() } );
    }
}

export default Server;