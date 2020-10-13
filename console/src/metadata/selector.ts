import { createSelector } from 'reselect';
import { ReduxState } from '../types';
import { TableEntry, DataSource } from './types';
import { filterInconsistentMetadataObjects } from '../components/Services/Settings/utils';
import { parseCustomTypes } from '../shared/utils/hasuraCustomTypeUtils';
import { Driver } from '../dataSources';
import {
  EventTrigger,
  ScheduledTrigger,
} from '../components/Services/Events/types';

export const getDataSourceMetadata = (state: ReduxState) => {
  const currentDataSource = state.tables.currentDataSource;
  if (!currentDataSource) return null;
  return state.metadata.metadataObject?.sources.find(
    source => source.name === currentDataSource
    // NOTE: Commented this since, kind is not being mentioned on the metadata object atm
    // &&
    // (source.kind || 'postgres') === currentDriver
  );
};

export const getRemoteSchemas = (state: ReduxState) => {
  return state.metadata.metadataObject?.remote_schemas ?? [];
};

export const getInitDataSource = (
  state: ReduxState
): { source: string; driver: Driver } => {
  const dataSources = state.metadata.metadataObject?.sources || [];
  // .filter(
  //   source => source.name !== 'default'
  // );
  if (dataSources.length) {
    return {
      source: dataSources[0].name,
      driver: dataSources[0].kind || 'postgres',
    };
  }
  return { source: '', driver: 'postgres' };
};

const getCurrentSchema = (state: ReduxState) => {
  return state.tables.currentSchema;
};

const getInconsistentObjects = (state: ReduxState) => {
  return state.metadata.inconsistentObjects;
};

const getTables = createSelector(getDataSourceMetadata, source => {
  return source?.tables || [];
});

const getMetadata = (state: ReduxState) => {
  return state.metadata.metadataObject;
};

const getActions = createSelector(
  getMetadata,
  metadata => metadata?.actions || []
);

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
  getDataSourceMetadata,
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
  [getMetadata, getInconsistentObjects],
  (metadata, objects) => {
    const actions =
      metadata?.actions?.map(action => ({
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

export const customTypesSelector = createSelector(getMetadata, metadata => {
  if (!metadata?.custom_types) return [];

  return parseCustomTypes(metadata.custom_types || []);
});

export const getRemoteSchemaSelector = createSelector(
  getRemoteSchemas,
  schemas => (name: string) => {
    return schemas.find(schema => schema.name === name);
  }
);

export const getEventTriggers = createSelector(
  getDataSourceMetadata,
  source => {
    if (!source) return [];

    return source.tables.reduce((acc, t) => {
      const triggers: EventTrigger[] =
        t.event_triggers?.map(trigger => ({
          table_name: t.table.name,
          schema_name: t.table.schema,
          source: source.name,
          name: trigger.name,
          comment: '',
          configuration: {
            definition: trigger.definition as any, // todo
            headers: trigger.headers || [],
            retry_conf: trigger.retry_conf,
            webhook: trigger.webhook || '',
            webhook_from_env: trigger.webhook_from_env,
          },
        })) || [];
      return [...triggers, ...acc];
    }, [] as EventTrigger[]);
  }
);

export const getCronTriggers = createSelector(getMetadata, metadata => {
  const cronTriggers: ScheduledTrigger[] = (metadata?.cron_triggers || []).map(
    cron => ({
      name: cron.name,
      payload: cron.payload,
      retry_conf: {
        ...cron.retry_conf,
      },
      header_conf: cron.headers,
      webhook_conf: cron.webhook,
      cron_schedule: cron.schedule,
      include_in_metadata: cron.include_in_metadata,
      comment: cron.comment,
    })
  );
  return cronTriggers || [];
});

export const getAllowedQueries = (state: ReduxState) =>
  state.metadata.allowedQueries || [];

export const getDataSources = createSelector(getMetadata, metadata => {
  const sources: DataSource[] = [];
  metadata?.sources.forEach(source => {
    sources.push({
      name: source.name,
      url: source.configuration?.database_url || 'HASURA_GRAPHQL_DATABASE_URL',
      fromEnv: false, // todo
      connection_pool_settings: source.configuration
        ?.connection_pool_settings || {
        retries: 1,
        idle_timeout: 180,
        max_connections: 50,
      },
      driver: source.kind || 'postgres',
    });
  });
  return sources;
  // .filter(source => source.name !== 'default');
});

export const getTablesBySource = createSelector(getMetadata, metadata => {
  const res: Record<string, { name: string; schema: string }[]> = {};
  metadata?.sources.forEach(source => {
    res[source.name] = source.tables.map(({ table }) => table);
  });
  return res;
});
