import { TMessages, TUser } from "../server/types";
import Mediator from "../mediator/Mediator";

const TOKEN = 'token';

class Store {
    [key: string]: any;
    user: TUser | null = null;
    messages: TMessages = [];
    chatHash: string = 'empty chat hash';
    mapHash: string = 'empty map hash';
    money: number = 0;
    mediator: Mediator;

    constructor(mediator: Mediator) {
        this.mediator = mediator;
    }

    set<T>(key: string, data: T): void {
        this[key] = data;
        this.mediator.call('MONEY_CHANGE');
    }

    get<T>(key: string): T | null {
        if (this[key]) {
            return this[key] as T;
        }
        return null;
    }

    setToken(token: string): void {
        localStorage.setItem(TOKEN, token);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN);
    }

    setUser(user: TUser): void {
        const { token } = user;
        this.setToken(token);
        this.user = user;
    }

    getUser(): TUser | null {
        return this.user;
    }

    clearUser(): void {
        this.user = null;
        this.setToken('');
    }

    addMessages(messages: TMessages): void {
        if (messages?.length) {
            this.messages = messages;
        }
    }

    getMessages(): TMessages {
        return this.messages;
    }

    clearMessages(): void {
        this.messages = [];
    }

    getChatHash(): string {
        return this.chatHash;
    }

    setChatHash(hash: string): void {
        this.chatHash = hash;
    }

    getMapHash(): string {
        return this.mapHash;
    }

    setMapHash(hash: string): void {
        this.mapHash = hash;
    }

    setMoney(money: number): void {
        this.money = money;
        this.mediator.call('MONEY_CHANGE');
    }

    getMoney(): number {
        return this.money;
    }
}

export default Store;