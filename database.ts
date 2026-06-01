import { Pool } from 'pg';

// El host debe coincidir con el nombre del servicio en docker-compose o k8s
// El puerto interno por defecto de Postgres es 5432
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'coniiti_main',
});

export default pool;