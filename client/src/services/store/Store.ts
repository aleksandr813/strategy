import { TMessages, TUser } from "../server/types";

const TOKEN = 'token';

type Listener = () => void;

class Store {
    user: TUser | null = null;
    messages: TMessages = [];
    chatHash: string = 'empty chat hash';
    money: number = 0;
    private listeners: Set<Listener> = new Set();

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        this.listeners.forEach(listener => listener());
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
        this.notify();
    }

    getUser(): TUser | null {
        return this.user;
    }

    clearUser(): void {
        this.user = null;
        this.setToken('');
        this.notify();
    }

    addMessages(messages: TMessages): void {
        if (messages?.length) {
            this.messages = messages;
            this.notify();
        }
    }

    getMessages(): TMessages {
        return this.messages;
    }

    clearMessages(): void {
        this.messages = [];
        this.notify();
    }

    getChatHash(): string {
        return this.chatHash;
    }

    setChatHash(hash: string): void {
        this.chatHash = hash;
        this.notify();
    }

    setMoney(money: number): void {
        this.money = money;
        this.notify();
    }

    getMoney(): number {
        return this.money;
    }
}

export default Store;