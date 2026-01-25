import { Sequelize } from 'sequelize';

declare module 'h3' {
    interface H3EventContext {
        sequelize: Sequelize;
    }
}

interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}