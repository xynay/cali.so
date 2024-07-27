import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间
  connectionTimeoutMillis: 2000, // 连接超时时间
});

export default {
  driver: 'pg',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: { connectionString: process.env.DATABASE_URL || '' },
  pool: pool, // 使用连接池
} satisfies Config;

// 验证数据库连接
pool.connect()
  .then(client => {
    return client.query('SELECT NOW()')
      .then(res => {
        console.log('Database connected:', res.rows[0]);
      })
      .finally(() => client.release());
  })
  .catch(err => {
    console.error('Database connection error:', err.stack);
  });