import { TMessages, TUser } from "../server/types";
import Building from "../../game/Buildings/Building";

const TOKEN = 'token';

class Store {
    user: TUser | null = null;
    messages: TMessages = [];
    chatHash: string = 'empty chat hash';
    buildings: Building[] = [];

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
        // TODO сделать, чтобы работало вот так
        //this.messages.concat(messages);
        // а вот это - плохой код!
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

    setBuildings(buildings: Building[]): void {
    this.buildings = buildings;
}

    getBuildings(): Building[] {
        return this.buildings;
    }

}

export default Store;