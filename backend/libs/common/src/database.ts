import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { DataSourceOptions } from 'typeorm';

export function createDatabaseConfig(
  urlOrPath: string,
  entities: DataSourceOptions['entities'],
): DataSourceOptions {
  // PostgreSQL — use when URL starts with postgresql:// or postgres://
  if (urlOrPath.startsWith('postgresql://') || urlOrPath.startsWith('postgres://')) {
    return {
      type: 'postgres',
      url: urlOrPath,
      entities,
      synchronize: true,
      ssl: urlOrPath.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
    } as DataSourceOptions;
  }

  // sql.js fallback for local dev without Docker
  const dir = dirname(urlOrPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return {
    type: 'sqljs',
    location: urlOrPath,
    autoSave: true,
    entities,
    synchronize: true,
  } as DataSourceOptions;
}

/** @deprecated Use createDatabaseConfig */
export function createSqlJsConfig(
  databasePath: string,
  entities: DataSourceOptions['entities'],
): DataSourceOptions {
  return createDatabaseConfig(databasePath, entities);
}
