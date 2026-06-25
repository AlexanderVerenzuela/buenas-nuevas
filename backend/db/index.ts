import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL && process.env.VERCEL) {
  console.error("CRITICAL ERROR: DATABASE_URL environment variable is not defined on Vercel!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Limitar a 1 conexión por instancia de función serverless
  connectionTimeoutMillis: 5000, // Timeout de conexión de 5 segundos
  idleTimeoutMillis: 10000, // Cerrar conexiones inactivas tras 10 segundos
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const db = drizzle(pool, { schema });
