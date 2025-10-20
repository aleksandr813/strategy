export interface ValidationResult {
    isValid: boolean;
    message: string;
}

// проверка логина
export const validateLogin = (login: string): ValidationResult => {
    if (login.length < 5 || login.length > 20) {
        return {
            isValid: false,
            message: 'Логин должен быть от 5 до 20 символов'
        };
    }

    if (/^[0-9_]/.test(login)) {
        return {
            isValid: false,
            message: 'Логин не должен начинаться с цифры или символа подчеркивания'
        };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(login)) {
        return {
            isValid: false,
            message: 'Логин может содержать только латинские буквы, цифры и символы подчеркивания'
        };
    }

    if (/\s/.test(login)) {
        return {
            isValid: false,
            message: 'Логин не должен содержать пробелы'
        };
    }

    if (/[@#$%]/.test(login)) {
        return {
            isValid: false,
            message: 'Логин не должен содержать специальные символы (@, #, $, %)'
        };
    }

    return {
        isValid: true,
        message: ''
    };
};

// проверка пароля
export const validatePassword = (password: string, login: string = '', name: string = ''): ValidationResult => {
    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Пароль должен быть не менее 8 символов'
        };
    }

    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: 'Пароль должен содержать хотя бы одну строчную букву'
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: 'Пароль должен содержать хотя бы одну заглавную букву'
        };
    }

    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: 'Пароль должен содержать хотя бы одну цифру'
        };
    }

    // Проверка на наличие персональной информации
    const personalInfo = [login, name].filter(Boolean);
    for (const info of personalInfo) {
        if (info && password.toLowerCase().includes(info.toLowerCase())) {
            return {
                isValid: false,
                message: 'Пароль не должен содержать логин или имя'
            };
        }
    }

    return {
        isValid: true,
        message: ''
    };
};

// проверка занятости логина (заглушка для реальной проверки)
export const checkLoginAvailability = async (login: string): Promise<ValidationResult> => {

    // если логины "admin" и "user" уже заняты
    const takenLogins = ['admin', 'user', 'test'];

    if (takenLogins.includes(login.toLowerCase())) {
        return {
            isValid: false,
            message: 'Этот логин уже занят'
        };
    }

    return {
        isValid: true,
        message: ''
    };
};
