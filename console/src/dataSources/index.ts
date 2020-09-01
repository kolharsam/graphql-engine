/* eslint-disable import/no-mutable-exports */
import { useState, useEffect } from 'react';
import { services } from './services';

import { Table, ComputedField, TableColumn } from './types';
import { PGFunction } from './services/postgresql/types';
import { Operations } from './common';
import { FrequentlyUsedColumn } from '../components/Services/Data/Common/Components/FrequentlyUsedColumnSelector';

export type Driver = 'postgres'; // | 'mysql';

export type ColumnsInfoResult = {
  [tableName: string]: {
    [columnName: string]: {
      is_generated: boolean;
      is_identity: boolean;
      identity_generation: 'ALWAYS' | 'BY DEFAULT' | string | null;
    };
  };
};

export interface DataSourcesAPI {
  isTable(table: Table): boolean;
  displayTableName(table: Table): JSX.Element;
  // todo: replace with function type
  getFunctionSchema(func: PGFunction): string;
  getFunctionName(func: PGFunction): string;
  getFunctionDefinition(func: PGFunction): string;
  getSchemaFunctions(func: PGFunction[], schemaName: string): PGFunction[];
  findFunction(
    func: PGFunction[],
    fName: string,
    fSchema: string
  ): PGFunction | undefined;
  getGroupedTableComputedFields(
    table: Table,
    allFunctions: PGFunction[]
  ): {
    scalar: ComputedField[];
    table: ComputedField[];
  };
  isColumnAutoIncrement(col: TableColumn): boolean;
  getTableSupportedQueries(table: Table): Operations[];
  getColumnType(col: TableColumn): string;
  arrayToPostgresArray(arr: any[]): string;
  initQueries: {
    schemaList: Record<string, any>;
    loadTrackedFunctions: Record<string, any>;
    loadTrackableFunctions: Record<string, any>;
    loadNonTrackableFunctions: Record<string, any>;
  };
  additionalColumnsInfoQuery: (schemaName: string) => Record<string, any>;
  parseColumnsInfoResult: (data: any) => ColumnsInfoResult;
  columnDataTypes: {
    INTEGER: string;
    SERIAL: string;
    BIGINT: string;
    BIGSERIAL: string;
    UUID: string;
    JSONDTYPE: string;
    JSONB: string;
    TIMESTAMP: string;
    TIME: string;
    NUMERIC: string;
    DATE: string;
    TIMETZ: string;
    BOOLEAN: string;
    TEXT: string;
    ARRAY: string;
  };
  getFetchTrackedTableFkQuery: (options: {
    schemas: string[];
    tables: Table[];
  }) => string;
  getFetchTrackedTableReferencedFkQuery: (options: {
    schemas: string[];
    tables: Table[];
  }) => string;
  getFetchTablesListQuery: (options: {
    schemas: string[];
    tables: Table[];
  }) => string;
  commonDataTypes: {
    name: string;
    value: string;
    description: string;
    hasuraDatatype?: string | null;
  }[];
  fetchColumnTypesQuery: string;
  fetchColumnDefaultFunctions(schema: string): string;
  isSQLFunction(str: string): boolean;
  getEstimateCountQuery: (schemaName: string, tableName: string) => string;
  isColTypeString(colType: string): boolean;
  cascadeSqlQuery(sql: string): string;
  dependecyErrorCode: string;
  getCreateTableQueries: (
    currentSchema: string,
    tableName: string,
    columns: any[],
    primaryKeys: (number | string)[],
    foreignKeys: any[],
    uniqueKeys: any[],
    checkConstraints: any[],
    tableComment?: string | undefined
  ) =>
    | string[]
    | {
        error: string;
      };
  getDropTableSql(schema: string, table: string): string;
  createSQLRegex: RegExp;
  getStatementTimeoutSql: (statementTimeoutInSecs: number) => string;
  getDropSchemaSql(schema: string): string;
  getCreateSchemaSql(schema: string): string;
  isTimeoutError: (error: any) => boolean;
  getAlterForeignKeySql: (
    from: {
      tableName: string;
      schemaName: string;
      columns: string[];
    },
    to: {
      tableName: string;
      schemaName: string;
      columns: string[];
    },
    dropConstraint: string,
    newConstraint: string,
    onUpdate: string,
    onDelete: string
  ) => string;
  getCreateFKeySql: (
    from: {
      tableName: string;
      schemaName: string;
      columns: string[];
    },
    to: {
      tableName: string;
      schemaName: string;
      columns: string[];
    },
    newConstraint: string,
    onUpdate: string,
    onDelete: string
  ) => string;
  getDropConstraintSql: (
    tableName: string,
    schemaName: string,
    constraintName: string
  ) => string;
  getRenameTableSql: (
    property: string | undefined,
    schemaName: string,
    oldName: string,
    newName: string
  ) => string;
  getDropTriggerSql: (
    tableName: string,
    tableSchema: string,
    triggerName: string
  ) => string;
  getCreateTriggerSql: (
    tableName: string,
    tableSchema: string,
    triggerName: string,
    trigger: {
      action_timing: string;
      event_manipulation: string;
      action_orientation: string;
      action_statement: string;
      comment: string;
    }
  ) => string;
  getDropSql: (
    tableName: string,
    schemaName: string,
    property?: string | undefined
  ) => string;
  getViewDefinitionSql: (viewName: string) => string;
  getDropColumnSql: (
    tableName: string,
    schemaName: string,
    columnName: string,
    options?: {
      // todo
      sqlGenerator?: FrequentlyUsedColumn['dependentSQLGenerator'];
    }
  ) => string;
  getAddColumnSql: (
    tableName: string,
    schemaName: string,
    columnName: string,
    columnType: string,
    options?: {
      nullable: boolean;
      unique: boolean;
      default: string;
      sqlGenerator?: FrequentlyUsedColumn['dependentSQLGenerator'];
    }
  ) => string | string[];
  getDropNullSql: (
    tableName: string,
    schemaName: string,
    columnName: string
  ) => string;
  getSetNullSql: (
    tableName: string,
    schemaName: string,
    columnName: string
  ) => string;
  getAddUniqueConstraintSql: (
    tableName: string,
    schemaName: string,
    constraintName: string,
    columns: string[]
  ) => string;
  getSetColumnDefaultSql: (
    tableName: string,
    schemaName: string,
    columnName: string,
    defaultValue: any,
    columnType: string
  ) => string;
  getSetCommentSql: (
    on: 'table' | 'column' | string, // todo
    tableName: string,
    schemaName: string,
    columnName: string,
    comment: string
  ) => string;
  getAlterColumnTypeSql: (
    tableName: string,
    schemaName: string,
    columnName: string,
    columnType: string
  ) => string;
  getDropColumnDefaultSql: (
    tableName: string,
    schemaName: string,
    columnName: string
  ) => string;
  getRenameColumnQuery: (
    tableName: string,
    schemaName: string,
    newName: string,
    oldName: string
  ) => string;
  fetchColumnCastsQuery: string;
  checkSchemaModification: (sql: string) => boolean;
  getCreateCheckConstraintSql: (
    tableName: string,
    schemaName: string,
    constraintName: string,
    check: string
  ) => string;
  getCreatePkSql: ({
    schemaName,
    tableName,
    selectedPkColumns,
    constraintName,
  }: {
    schemaName: string;
    tableName: string;
    selectedPkColumns: string[];
    constraintName: string;
  }) => string;
}

export let currentDriver: Driver = 'postgres';
export let dataSource: DataSourcesAPI = services[currentDriver];

class DataSourceChangedEvent extends Event {
  static type = 'data-source-changed';
  constructor(public driver: Driver) {
    super(DataSourceChangedEvent.type);
  }
}
const eventTarget = new EventTarget();

export const setDriver = (driver: Driver) => {
  currentDriver = driver;
  dataSource = services[driver];

  eventTarget.dispatchEvent(new DataSourceChangedEvent(driver));
};

export const useDataSource = (): {
  driver: Driver;
  setDriver: (driver: Driver) => void;
  dataSource: DataSourcesAPI;
} => {
  const [driver, setState] = useState(currentDriver);

  useEffect(() => {
    const handleDriverChange = (event: Event) => {
      if (event instanceof DataSourceChangedEvent) {
        setState(event.driver);
      }
    };

    eventTarget.addEventListener(
      DataSourceChangedEvent.type,
      handleDriverChange
    );

    return () => {
      eventTarget.removeEventListener(
        DataSourceChangedEvent.type,
        handleDriverChange
      );
    };
  });

  return {
    driver,
    dataSource,
    setDriver,
  };
};

if ((module as any).hot) {
  // // todo
  // (module as any).hot.dispose((data: any) => {
  //   data.driver = currentDriver;
  // });
  // (module as any).hot.accept(['./postgres'], () => {
  //   currentDriver = (module as any).hot.data.driver;
  // });
}

export * from './common';