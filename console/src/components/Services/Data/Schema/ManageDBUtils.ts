import { DataSource } from '../../../../metadata/types';
import { Driver } from '../../../../dataSources';

export const getHostFromConnectionString = (datasource: DataSource) => {
  const connectionString =
    typeof datasource.url === 'string'
      ? datasource.url
      : datasource.url.from_env;
  // this is for postgres
  if (
    connectionString.includes('postgresql') ||
    connectionString.indexOf('postgresql') !== -1
  ) {
    return connectionString.split('@')[1].split(':')[0];
  }
  // TODO: update this function with connection string for other databases
  return null;
};

export const makeConnectionStringFromConnectionParams = (
  dbType: Driver,
  host: string,
  port: string,
  username: string,
  database: string,
  password?: string
) => {
  if (dbType === 'postgres') {
    if (!password) {
      return `postgresql://${username}@${host}:${port}/${database}`;
    }
    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }

  // TODO: update this function to work for the other database drivers
  throw new Error('Not implemented for other database drivers');
};
