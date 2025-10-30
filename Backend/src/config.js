// src/config.js
import 'dotenv/config';

export const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'si_akreditasi_new2',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'devsecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
  }
};
