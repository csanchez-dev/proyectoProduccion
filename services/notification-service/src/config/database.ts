import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        read BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);
    client.release();
    console.log('Connected to PostgreSQL and notifications table ready');
  } catch (error) {
    console.warn('[DB] No se pudo conectar a PostgreSQL. El servicio seguirá intentando en segundo plano.');
  }
}

export default pool;