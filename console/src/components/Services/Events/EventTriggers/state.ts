import React from 'react';
import {
  URLConf,
  EventTriggerOperation,
  ETOperationColumn,
  EventTrigger,
  RetryConf,
} from '../types';
import { Header, defaultHeader } from '../../../Common/Headers/Headers';
import {
  parseServerWebhook,
  parseEventTriggerOperations,
  getETOperationColumns,
  findETTable,
} from '../utils';
import { parseServerHeaders } from '../../../Common/Headers/utils';
import { Table } from '../../../../dataSources/types';
import { generateTableDef } from '../../../../dataSources';
import {
  QualifiedTable,
  HasuraMetadataV2,
  HasuraMetadataV3,
} from '../../../../metadata/types';

export type LocalEventTriggerState = {
  name: string;
  source: string;
  table: QualifiedTable;
  operations: Record<EventTriggerOperation, boolean>;
  operationColumns: ETOperationColumn[];
  webhook: URLConf;
  retryConf: RetryConf;
  headers: Header[];
};

const defaultState: LocalEventTriggerState = {
  name: '',
  table: {
    name: '',
    schema: 'public',
  },
  operations: {
    insert: false,
    update: false,
    delete: false,
    enable_manual: false,
  },
  operationColumns: [],
  webhook: {
    type: 'static',
    value: '',
  },
  retryConf: {
    num_retries: 0,
    interval_sec: 10,
    timeout_sec: 60,
  },
  headers: [defaultHeader],
  source: 'default',
};

export const parseServerETDefinition = (
  eventTrigger?: EventTrigger,
  table?: Table
): LocalEventTriggerState => {
  if (!eventTrigger) {
    return defaultState;
  }

  const etConf = eventTrigger.configuration;
  const etDef = etConf?.definition ?? {};

  const etTableDef = generateTableDef(
    eventTrigger.table_name,
    eventTrigger.schema_name
  );

  return {
    name: eventTrigger.name,
    source: '', // todo
    table: etTableDef,
    operations: parseEventTriggerOperations(etDef),
    operationColumns: table
      ? getETOperationColumns(
          etDef.update ? etDef.update.columns : [],
          table.columns
        )
      : [],
    webhook: parseServerWebhook(
      etConf?.webhook ?? '',
      etConf?.webhook_from_env ?? ''
    ),
    retryConf: etConf?.retry_conf ?? {},
    headers: parseServerHeaders(eventTrigger.configuration?.headers),
  };
};

export const useEventTrigger = (initState?: LocalEventTriggerState) => {
  const [state, setState] = React.useState(initState || defaultState);
  return {
    state,
    setState: {
      name: (name: string) => {
        setState(s => ({
          ...s,
          name,
        }));
      },
      source: (source: string) => {
        setState(s => ({
          ...s,
          source,
        }));
      },
      table: (tableName?: string, schemaName?: string) => {
        setState(s => {
          let newTableDef = { ...s.table };
          if (schemaName && schemaName !== newTableDef.schema) {
            newTableDef = {
              name: '',
              schema: schemaName,
            };
          } else if (tableName) {
            newTableDef = {
              ...newTableDef,
              name: tableName,
            };
          }
          return {
            ...s,
            table: newTableDef,
          };
        });
      },
      operations: (operations: Record<EventTriggerOperation, boolean>) => {
        setState(s => ({
          ...s,
          operations,
        }));
      },
      webhook: (webhook: URLConf) => {
        setState(s => {
          return {
            ...s,
            webhook,
          };
        });
      },
      retryConf: (r: RetryConf) => {
        setState(s => ({
          ...s,
          retryConf: r,
        }));
      },
      headers: (headers: Header[]) => {
        setState(s => ({
          ...s,
          headers,
        }));
      },
      operationColumns: (columns: ETOperationColumn[]) => {
        setState(s => ({
          ...s,
          operationColumns: columns,
        }));
      },
      bulk: (s: LocalEventTriggerState) => {
        setState(s);
      },
    },
  };
};

export const useEventTriggerModify = (
  eventTrigger: EventTrigger,
  allTables: Table[],
  metadataObject?: HasuraMetadataV2 | HasuraMetadataV3 | null
) => {
  let modifiedEventTriggerObj = eventTrigger;
  if (metadataObject) {
    const tablesFromMetadata = (metadataObject as HasuraMetadataV3).sources.map(
      tab => tab.tables
    );
    const reducedMetadataTables = tablesFromMetadata.reduce(
      (acc, val) => acc.concat(val),
      []
    );
    const currentEventTriggerTab = reducedMetadataTables.find(tab =>
      tab.event_triggers?.find(evt => evt.name === eventTrigger.name)
    );
    if (currentEventTriggerTab) {
      modifiedEventTriggerObj = {
        ...modifiedEventTriggerObj,
        table_name: currentEventTriggerTab.table.name,
        schema_name: currentEventTriggerTab.table.schema,
      };
    }
  }
  const table = findETTable(modifiedEventTriggerObj, allTables);
  const { state, setState } = useEventTrigger(
    parseServerETDefinition(modifiedEventTriggerObj, table)
  );

  React.useEffect(() => {
    if (allTables.length) {
      const etTable = findETTable(modifiedEventTriggerObj, allTables);
      setState.bulk(parseServerETDefinition(modifiedEventTriggerObj, etTable));
    }
  }, [allTables]);
  return {
    state,
    setState,
  };
};

export default defaultState;
