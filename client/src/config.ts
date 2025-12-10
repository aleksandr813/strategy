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
    //HOST: 'http://strategy/api',
    //HOST: 'http://server/api',
    //HOST: 'http://strategy1/api',
    HOST: 'http://strategy/server/api',

    CHAT_TIMESTAMP: 200, //ms

    SPRITE_SIZE: 64, // размер спрайта в пикселях
    LINE_OF_SPRITES: 20, // количество спрайтов в карте спрайтов
    WIDTH: 50, // ширина карты
    HEIGHT: 32, // высота карты 
    CHAT_MAX_MESSAGE_LENGTH: 100, // максимальная длина сообщения в чате
    // игровое окно, видимое пользователю
    WINDOW: {
        LEFT: 0,
        TOP: 0,
        HEIGHT: 10,
        WIDTH: 20,
    },


    MEDIATOR: {
        EVENTS: {
            MONEY_CHANGE: 'MONEY_CHANGE', // какое-то событие
        },
        TRIGGERS: {
            SET_STORE: 'SET_STORE', // записать в стор
            GET_STORE: 'GET_STORE', // получить из стора
        },
    },
};

export default CONFIG;