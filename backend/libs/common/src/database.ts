import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { DataSourceOptions } from 'typeorm';

export function createSqlJsConfig(
  databasePath: string,
  entities: DataSourceOptions['entities'],
): DataSourceOptions {
  const dir = dirname(databasePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return {
    type: 'sqljs',
    location: databasePath,
    autoSave: true,
    entities,
    synchronize: true,
  };
}
