export type TPoint = {
    x: number;
    y: number;
}

export enum EDIRECTION {
    LEFT = 'left',
    RIGHT = 'right',
    UP = 'up',
    DOWN = 'down',
};

export type TWINDOW = {
    LEFT: number;
    TOP: number;
    HEIGHT: number;
    WIDTH: number;
}

const CONFIG = {
    //udsu 
    HOST: 'http://strategy1/api',
    //HOST: 'http://server/api',

    CHAT_TIMESTAMP: 200, //ms

    SPRITE_SIZE: 64, // размер спрайта в пикселях
    LINE_OF_SPRITES: 20, // количество спрайтов в карте спрайтов
    WIDTH: 50, // ширина карты
    HEIGHT: 32, // высота карты 
    // игровое окно, видимое пользователю
    WINDOW: {
        LEFT: 0,
        TOP: 0,
        HEIGHT: 10,
        WIDTH: 20,
    },
};

export default CONFIG;