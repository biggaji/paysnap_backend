import { Pool } from 'pg';

const db_port = Number(process.env.DB_PORT);
export const db = new Pool ({
    user: process.env.DB_USER,
    port: db_port,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST
});
