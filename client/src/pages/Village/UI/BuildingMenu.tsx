import Building from "../../../game/Buildings/Building";
import "./BuildingMenu.css";

export default class BuildingMenu {
    private menuElement: HTMLDivElement | null = null;
    private parentElement: HTMLElement;

    constructor(parentId: string) {
        const parent = document.getElementById(parentId);
        if (!parent) throw new Error(`Parent element #${parentId} not found`);
        this.parentElement = parent;
    }

    showMenu(building: Building) {
        this.hideMenu();

        const info = building.getInfo();

        const overlay = document.createElement("div");
        overlay.className = "menu-overlay";

        const container = document.createElement("div");
        container.className = "menu-container";
        container.innerHTML = `
            <div class="menu-header">
                <div class="name-lvl">${info.name} (lvl ${info.level})</div>
                <div class="hp-status">HP: ${info.hp}/${info.maxHp}</div>
            </div>
            <div class="menu-footer">
                <button class="levelup-button">Level Up</button>
                <button class="delete-button">Delete</button>
            </div>
        `;

        overlay.appendChild(container);
        document.body.appendChild(overlay);

        this.menuElement = overlay;

        overlay.addEventListener("click", () => this.hideMenu());
        container.addEventListener("click", (e) => e.stopPropagation());
    }

    hideMenu() {
        if (this.menuElement) {
            this.menuElement.remove();
            this.menuElement = null;
        }
    }

    hasMenu() {
        return !!this.menuElement;
    }
}
