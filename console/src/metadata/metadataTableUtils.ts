import { QualifiedTable } from './types';
import { dataSource } from '../dataSources';
import { getRunSqlQuery } from '../components/Common/utils/v1QueryUtils';

export const getLogSql = (
  queryType: 'select' | 'count',
  triggerName: string | undefined,
  table: QualifiedTable,
  relationships: string[],
  limit?: number,
  offset?: number
) => {
  let eventType: 'cron' | 'scheduled' = 'cron';
  // FIXME: test and change for scheduled events
  if (
    relationships[0]?.includes('scheduled') ||
    table.name.includes('scheduled')
  ) {
    eventType = 'scheduled';
  }

  const relTable: QualifiedTable = {
    schema: 'hdb_catalog',
    name: `hdb_${eventType}_events`,
  };

  if (!dataSource.getInvocationLogSql) {
    return;
  }

  const sql = dataSource.getInvocationLogSql(
    eventType,
    table,
    relTable,
    triggerName,
    limit,
    offset
  );

  // todo: wait for API / write new SQL for this.
  // if (queryType === 'count') {
  //   sql += ';';
  // } else {
  //   sql += ` LIMIT ${limit ?? 10} OFFSET ${offset ?? 0};`;
  // }

  return getRunSqlQuery(sql, 'default');
};
