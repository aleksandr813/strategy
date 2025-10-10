// Базовый класс Unit
export class Unit {
    sprite: string = ''; // путь к PNG файлу спрайта
    hp: number | undefined; // здоровье
    damage: number | undefined;
    x: number = 0; // позиция в матрице
    y: number = 0; // позиция в матрице
    
    constructor(x: number = 0, y: number = 0, sprite: string = '', hp?: number, damage?: number) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.hp = hp;
        this.damage = damage;
    }
}

// Наследный класс DefaultUnit с предустановленной текстурой
export class DefaultUnit extends Unit {
    constructor(x: number = 0, y: number = 0, hp: number = 100, damage: number = 25) {
        super(x, y, './assets/img/sprites/defaultUnit.png', hp, damage);
    }
}

// Экспортируем DefaultUnit как default для обратной совместимости
export default DefaultUnit;