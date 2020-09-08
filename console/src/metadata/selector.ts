import { createSelector } from 'reselect';
import { ReduxState } from '../types';
import {
  TableEntry,
  HasuraMetadataV2,
  HasuraMetadataV3,
  DataSource,
} from './types';
import { filterInconsistentMetadataObjects } from '../components/Services/Settings/utils';
import { parseCustomTypes } from '../shared/utils/hasuraCustomTypeUtils';
import { currentDriver } from '../dataSources';

const isMetadataV3 = (
  x: HasuraMetadataV2 | HasuraMetadataV3 | null
): x is HasuraMetadataV3 => {
  return x?.version === '3';
};

export const getDataSourceMatadata = (state: ReduxState) => {
  if (isMetadataV3(state.metadata.metadataObject)) {
    const currentDataSource = state.tables.currentDataSource;
    if (!currentDataSource) return null;
    if (currentDriver === 'mysql') {
      return state.metadata.metadataObject.mysql_sources.find(
        source => source.name === currentDataSource
      );
    }
    return state.metadata.metadataObject.mysql_sources.find(
      source => source.name === currentDataSource
    );
  }
  return state.metadata.metadataObject;
};

export const getInitDataSource = (state: ReduxState) => {
  if (isMetadataV3(state.metadata.metadataObject)) {
    if (
      state.metadata.metadataObject.postgres_sources &&
      state.metadata.metadataObject.postgres_sources.length
    ) {
      return {
        source: state.metadata.metadataObject.postgres_sources[0].name,
        driver: 'postgres',
      };
    } else if (
      state.metadata.metadataObject.mysql_sources &&
      state.metadata.metadataObject.mysql_sources.length
    ) {
      return {
        source: state.metadata.metadataObject.mysql_sources[0].name,
        driver: 'mysql',
      };
    }
  }
  return { source: '', driver: 'postgres' };
};

const getCurrentSchema = (state: ReduxState) => {
  return state.tables.currentSchema;
};

const getInconsistentObjects = (state: ReduxState) => {
  return state.metadata.inconsistentObjects;
};

const getTables = createSelector(getDataSourceMatadata, source => {
  return source?.tables || [];
});

const getActions = createSelector(
  getDataSourceMatadata,
  source => source?.actions || []
);

const getMetadata = (state: ReduxState) => {
  return state.metadata.metadataObject;
};

type PermKeys = Pick<
  TableEntry,
  | 'update_permissions'
  | 'select_permissions'
  | 'delete_permissions'
  | 'insert_permissions'
>;
const permKeys: Array<keyof PermKeys> = [
  'insert_permissions',
  'update_permissions',
  'select_permissions',
  'delete_permissions',
];
export const rolesSelector = createSelector(
  [getTables, getActions],
  (tables, actions) => {
    const roleNames: string[] = [];
    tables?.forEach(table =>
      permKeys.forEach(key =>
        table[key]?.forEach(({ role }: { role: string }) =>
          roleNames.push(role)
        )
      )
    );
    actions?.forEach(action =>
      action.permissions?.forEach(p => roleNames.push(p.role))
    );
    return Array.from(new Set(roleNames));
  }
);

const getRemoteSchemas = createSelector(
  getDataSourceMatadata,
  source => source?.remote_schemas || []
);

export const getRemoteSchemasSelector = createSelector(
  [getRemoteSchemas, getInconsistentObjects],
  (schemas, inconsistentObjects) => {
    return filterInconsistentMetadataObjects(
      schemas,
      inconsistentObjects,
      'remote_schemas'
    );
  }
);

export const remoteSchemasNamesSelector = createSelector(
  getRemoteSchemas,
  schemas => schemas?.map(schema => schema.name)
);

type Options = {
  schemas?: string[];
  tables?: {
    table_schema: string;
    table_name: string;
  }[];
};
export const getTablesInfoSelector = createSelector(
  getTables,
  tables => (options: Options) => {
    if (options.schemas) {
      return tables?.filter(t => options?.schemas?.includes(t.table.schema));
    }
    if (options.tables) {
      return tables?.filter(t =>
        options.tables?.find(
          optTable =>
            optTable.table_name === t.table.name &&
            optTable.table_schema === t.table.schema
        )
      );
    }
    return tables;
  }
);

const getFunctions = createSelector(
  getDataSourceMatadata,
  source =>
    source?.functions?.map(f => ({
      ...f.function,
      function_name: f.function.name,
      function_schema: f.function.schema,
      configuration: f.configuration,
    })) || []
);

export const getFunctionSelector = createSelector(
  getFunctions,
  functions => (name: string, schema: string) => {
    return functions?.find(
      f => f.function_name === name && f.function_schema === schema
    );
  }
);

export const getConsistentFunctions = createSelector(
  [getFunctions, getInconsistentObjects, getCurrentSchema],
  (funcs, objects, schema) => {
    return filterInconsistentMetadataObjects(
      funcs.filter(f => f.function_schema === schema),
      objects,
      'functions'
    );
  }
);

const getCurrentFunctionInfo = (state: ReduxState) => ({
  name: state.functions.functionName,
  schema: state.functions.functionSchema,
});

export const getFunctionConfiguration = createSelector(
  getFunctions,
  getCurrentFunctionInfo,
  (funcs, { name, schema }) => {
    const func = funcs.find(
      f => f.function_name === name && f.function_schema === schema
    );
    return func?.configuration;
  }
);

export const actionsSelector = createSelector(
  [getDataSourceMatadata, getInconsistentObjects],
  (source, objects) => {
    const actions =
      source?.actions?.map(action => ({
        ...action,
        definition: {
          ...action.definition,
          headers: action.definition.headers || [],
        },
        permissions: action.permissions || [],
      })) || [];

    return filterInconsistentMetadataObjects(actions, objects, 'actions');
  }
);

export const customTypesSelector = createSelector(
  getDataSourceMatadata,
  source => {
    if (!source) return [];

    return parseCustomTypes(source.custom_types || []);
  }
);

export const getRemoteSchemaSelector = createSelector(
  getRemoteSchemas,
  schemas => (name: string) => {
    return schemas.find(schema => schema.name === name);
  }
);

export const getAllowedQueries = (state: ReduxState) =>
  state.metadata.allowedQueries || [];

export const getDataSources = createSelector(getMetadata, metadata => {
  console.log({ metadata });
  if (isMetadataV3(metadata)) {
    const sources: DataSource[] = [];
    metadata.mysql_sources.forEach(source => {
      sources.push({
        name: source.name,
        url:
          'from_value' in source.url
            ? source.url.from_value
            : source.url.from_env,
        fromEnv: !!('from_env' in source.url && source.url.from_env),
        connection_pool_settings: source.connection_pool_settings,
        driver: 'mysql',
      });
    });
    metadata.postgres_sources.forEach(source => {
      sources.push({
        name: source.name,
        url:
          'from_value' in source.url
            ? source.url.from_value
            : source.url.from_env,
        fromEnv: !!('from_env' in source.url && source.url.from_env),
        connection_pool_settings: source.connection_pool_settings,
        driver: 'postgres',
      });
    });
    return sources;
  }

  return [
    { name: 'Warehouse DB', driver: 'postgres' },
    { name: 'Users DB', driver: 'mysql' },
  ]; // todo
});