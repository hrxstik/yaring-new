import type { DataSourceOptions } from 'typeorm';

export function createDatabaseConfig(
  databaseUrl: string,
  entities: DataSourceOptions['entities'],
): DataSourceOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities,
    synchronize: true,
    ssl: databaseUrl.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
  } as DataSourceOptions;
}
