import { DataSource } from "../../../../metadata/types";

export const getHostFromConnectionString = (datasource: DataSource) => {
    const connectionString = typeof datasource.url === 'string' ? datasource.url : datasource.url.from_env;
    // this is for postgres
    if (connectionString.includes('postgresql') || connectionString.indexOf("postgresql") !== -1) {
        return connectionString.split("@")[1].split(':')[0];
    }
    // TODO: update this function with connection string for other databases
    return null;
};