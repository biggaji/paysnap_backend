import { Pool } from 'pg';

const db_port = Number(process.env.DB_PORT);
export const db = new Pool ({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
