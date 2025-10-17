// src/config.js
import 'dotenv/config';
export const config = {
  db: {
    host: process.env.DB_HOST, port: +process.env.DB_PORT || 3306,
    user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  port: +process.env.PORT || 3000,
};
