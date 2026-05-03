import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDb() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) return null;
  const sql = neon(url);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (_db === undefined) {
    _db = createDb();
  }
  return _db;
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
