import { Sequelize } from "sequelize";
import pg from "pg";
import { initModels } from "../models";
import { NitroApp } from "nitropack";
import { config } from 'dotenv'

config({path: '.env'});

export const sequelize: Sequelize = new Sequelize({
    dialect: 'postgres',
    dialectModule: pg,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialectOptions: {
        ssl: process.env.MODE === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    logging: false,
});

sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connection established successfully');
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err.message);
    });

initModels(sequelize);

export default defineNitroPlugin((nitroApp: NitroApp) => {
    nitroApp.hooks.hook("request", (event) => {
        event.context.sequelize = sequelize;
    });
});