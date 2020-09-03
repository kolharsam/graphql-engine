import React from 'react';
import { DataSourcesAPI } from '../..';
import { Table } from '../../types';
import { AlterFKTableInfo, MySQLTrigger } from './types';
import { getMySQLNameString } from './utils';
import { isColTypeString } from '../postgresql';
import { isSQLFunction } from '../postgresql/sqlUtils';

// Change this to the format to what is present on the postgres side
export const mysql: DataSourcesAPI = {
  isTable: (table: Table) => {
    return table.table_type === 'BASE TABLE';
  },
  displayTableName: (table: Table) => {
    return mysql.isTable(table) ? (
      <span>{table.table_name}</span>
    ) : (
      <i>{table.table_name}</i>
    );
  },
  getFunctionSchema: () => {
    throw new Error('not implemented');
  },
  getFunctionDefinitionSql: () => {
    throw new Error('not implemented');
  },
  getFunctionDefinition: () => {
    throw new Error('not implemented');
  },
  getSchemaFunctions: () => {
    throw new Error('not implemented');
  },
  findFunction: () => {
    throw new Error('not implemented');
  },
  getGroupedTableComputedFields: () => {
    throw new Error('not implemented');
  },
  isColumnAutoIncrement: () => {
    throw new Error('not implemented');
  },
  getTableSupportedQueries: () => {
    throw new Error('not implemented');
  },
  getColumnType: () => {
    throw new Error('not implemented');
  },
  arrayToPostgresArray: () => {
    throw new Error('not implemented');
  },
  initQueries: {} as DataSourcesAPI['initQueries'],
  additionalColumnsInfoQuery: () => {
    throw new Error('not implemented');
  },
  parseColumnsInfoResult: () => {
    throw new Error('not implemented');
  },
  columnDataTypes: ({} as any) as DataSourcesAPI['columnDataTypes'],
  getFetchTrackedTableFkQuery: () => {
    throw new Error('not implemented');
  },
  getFetchTrackedTableReferencedFkQuery: () => {
    throw new Error('not implemented');
  },
  getFetchTablesListQuery: () => {
    throw new Error('not implemented');
  },
  commonDataTypes: [],
  fetchColumnTypesQuery: '',
  fetchColumnDefaultFunctions: () => {
    throw new Error('not implemented');
  },
  isSQLFunction: () => {
    throw new Error('not implemented');
  },
  getEstimateCountQuery: () => {
    throw new Error('not implemented');
  },
  isColTypeString: () => {
    throw new Error('not implemented');
  },
  cascadeSqlQuery: () => {
    throw new Error('not implemented');
  },
  dependecyErrorCode: '',
  getCreateTableQueries: () => {
    throw new Error('not implemented');
  },
  getDropTableSql: () => {
    throw new Error('not implemented');
  },
  createSQLRegex: /?/,
  getStatementTimeoutSql: () => {
    throw new Error('not implemented');
  },
  getDropSchemaSql: () => {
    throw new Error('not implemented');
  },
  getCreateSchemaSql: () => {
    throw new Error('not implemented');
  },
  isTimeoutError: () => {
    throw new Error('not implemented');
  },
  getAlterForeignKeySql: (
    from: AlterFKTableInfo,
    to: AlterFKTableInfo,
    dropConstraint: string,
    newConstraint: string,
    onUpdate: string,
    onDelete: string
  ) => `
     alter table ${getMySQLNameString(
       from.schemaName,
       from.tableName
     )} drop foreign key \`${dropConstraint}\`;
     alter table ${getMySQLNameString(to.schemaName, to.tableName)}
     add constraint \`${newConstraint}\` foreign key (${from.columns.join(
    ', '
  )})
     references ${getMySQLNameString(to.schemaName, to.tableName)}
     (${to.columns.join(', ')}) on update ${onUpdate} on delete ${onDelete};
   `,
  getCreateFKeySql: (
    from: AlterFKTableInfo,
    to: AlterFKTableInfo,
    newConstraint: string,
    onUpdate: string,
    onDelete: string
  ) => `
  alter table ${getMySQLNameString(to.schemaName, to.tableName)}
  add constraint \`${newConstraint}\` foreign key (${from.columns.join(', ')})
  references ${getMySQLNameString(to.schemaName, to.tableName)}
  (${to.columns.join(', ')}) on update ${onUpdate} on delete ${onDelete};
  `,
  getDropConstraintSql: (
    tableName: string,
    schemaName: string,
    constraintName: string
  ) => `
    alter table ${getMySQLNameString(
      schemaName,
      tableName
    )} drop constaint ${constraintName};
  `,
  getRenameTableSql: (
    property = 'table',
    oldName: string,
    schemaName: string,
    newName: string
  ) => `
    alter ${property} ${getMySQLNameString(
    schemaName,
    oldName
  )} rename to ${newName};
  `,
  getDropTriggerSql: (tableSchema: string, triggerName: string) => `
    DROP TRIGGER IF EXISTS ${getMySQLNameString(tableSchema, triggerName)};
  `,
  getCreateTriggerSql: (
    tableName: string,
    tableSchema: string,
    triggerName: string,
    trigger: MySQLTrigger
  ) => `
    CREATE TRIGGER \`${triggerName}\`
    ${trigger.action_timing} ${
    trigger.event_manipulation
  } ON ${getMySQLNameString(tableSchema, tableName)}
    FOR EACH ${trigger.action_orientation} ${trigger.action_statement};
  `,
  getDropSql: (tableName: string, schemaName: string, property = 'table') => `
    drop ${property} ${getMySQLNameString(schemaName, tableName)};
  `,
  getViewDefinitionSql: () => {
    throw new Error('not implemented');
  },
  getDropColumnSql: (
    tableName: string,
    schemaName: string,
    columnName: string
  ) => `
    alter table ${getMySQLNameString(
      schemaName,
      tableName
    )} drop column \`${columnName}\`;
  `,
  getAddColumnSql: (
    tableName: string,
    schemaName: string,
    columnName: string,
    columnType: string,
    options?: { nullable: boolean; unique: boolean; default: any }
  ) => {
    let sql = `alter table ${getMySQLNameString(
      schemaName,
      tableName
    )} add column \`${columnName}\` ${columnType}`;

    if (!options) {
      return sql;
    }

    if (options.nullable) {
      sql += ' null';
    } else {
      sql += ' not null';
    }
    if (options.unique) {
      sql += ' unique';
    }
    if (options.default) {
      let defaultVal = options.default;
      if (isColTypeString(columnType) && !isSQLFunction(options.default)) {
        defaultVal = `'${options.default}'`;
      }
      sql += defaultVal;
    }

    return sql;
  },
  getAddUniqueConstraintSql: (tableName: string, schemaName: string, constraintName: string, columns: string[]) => `
    alter table ${getMySQLNameString(schemaName, tableName)} add constraint ${constraintName} unique (${columns.join(', ')});
  `,
  getDropNotNullSql: (
    tableName: string,
    schemaName: string,
    columnName: string,
    columnType?: string
  ) => `
    alter table ${getMySQLNameString(
      schemaName,
      tableName
    )} modify \`${columnName}\` ${columnType};
  `,
  getSetCommentSql: () => {
    throw new Error('not implemented');
  },
  getSetColumnDefaultSql: (tableName: string, schemaName: string, columnName: string, defaultValue: any, columnType: string) => {
    let defVal = defaultValue;
    if (isColTypeString(columnType) && !isSQLFunction(defaultValue)) {
      defVal = `'${defaultValue}'`;
    }
    return `
      alter table ${getMySQLNameString(schemaName, tableName)} alter \`${columnName}\` set default ${defVal};
    `;
  },
  getSetNotNullSql: (
    tableName: string,
    schemaName: string,
    columnName: string,
    columnType?: string
  ) => `
    alter table ${getMySQLNameString(
      schemaName,
      tableName
    )} modify \`${columnName}\` ${columnType} not null;
  `,
  getAlterColumnTypeSql: () => {
    throw new Error('not implemented');
  },
  getDropColumnDefaultSql: () => {
    throw new Error('not implemented');
  },
  getRenameColumnQuery: () => {
    throw new Error('not implemented');
  },
  fetchColumnCastsQuery: '',
  checkSchemaModification: () => {
    throw new Error('not implemented');
  },
  getCreateCheckConstraintSql: () => {
    throw new Error('not implemented');
  },
  getCreatePkSql: () => {
    throw new Error('not implemented');
  },
};
