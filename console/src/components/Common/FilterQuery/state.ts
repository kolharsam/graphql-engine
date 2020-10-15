import React from 'react';
import { OrderBy, makeOrderBy } from '../utils/v1QueryUtils';
import requestAction from '../../../utils/requestAction';
import { Dispatch } from '../../../types';
import endpoints from '../../../Endpoints';
import {
  makeFilterState,
  SetFilterState,
  ValueFilter,
  makeValueFilter,
  Filter,
  RunQuery,
} from './types';

import { Nullable } from '../utils/tsUtils';
import { QualifiedTable } from '../../../metadata/types';
import { getScheduledEvents } from '../../../metadata/queryUtils';

const defaultFilter = makeValueFilter('', null, '');
const defaultSort = makeOrderBy('', 'asc');

const defaultState = makeFilterState([defaultFilter], [defaultSort], 10, 0);

export const useFilterQuery = (
  table: QualifiedTable,
  dispatch: Dispatch,
  presets: {
    filters: Filter[];
    sorts: OrderBy[];
  },
  relationships: Nullable<string[]>,
  triggerName?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentSource?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  triggerType?: 'cron' | 'data' | 'one_off',
  triggerOp?: 'processed' | 'pending' | 'invocation'
) => {
  const [state, setState] = React.useState(defaultState);
  const [rows, setRows] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const runQuery: RunQuery = (runQueryOpts = {}) => {
    setLoading(true);
    setError(false);

    const { offset, limit, sorts: newSorts } = runQueryOpts;

    // const where = {
    //   $and: [...state.filters, ...presets.filters]
    //     .filter(f => !!f.key && !!f.value)
    //     .map(f => parseFilter(f)),
    // };

    // const orderBy = newSorts || [
    //   ...state.sorts.filter(f => !!f.column),
    //   ...presets.sorts,
    // ];

    // const offsetValue = isNotDefined(offset) ? state.offset : offset;
    // const limitValue = isNotDefined(limit) ? state.limit : limit;

    // const query = getLogSql(
    //   'select',
    //   triggerName,
    //   table,
    //   relationships ?? [],
    //   limitValue ?? 10,
    //   offsetValue ?? 0
    // );

    // const countQuery = getLogSql(
    //   'count',
    //   triggerName,
    //   table,
    //   relationships ?? [],
    //   undefined,
    //   undefined
    // );

    let query = {};

    if (table.name.includes('scheduled')) {
      // fixme: hack
      query = getScheduledEvents('one_off');
    } else if (table.name.includes('cron')) {
      // check this
      query = getScheduledEvents('cron', triggerName);
    }
    if (triggerType && triggerType === 'data') {
      // FIXME: temp. soln. until the API is added
      return {
        rows,
        loading,
        error,
        runQuery,
        state,
        count,
        undefined,
      };
    }

    const options = {
      method: 'POST',
      body: JSON.stringify(query),
    };

    dispatch(
      requestAction(
        endpoints.metadata,
        options,
        undefined,
        undefined,
        true,
        true
      )
    ).then(
      (data: any) => {
        let filteredData = data?.events ?? [];
        if (triggerOp === 'pending') {
          filteredData = data.events.filter(
            (row: { status?: string }) => row?.status === 'scheduled'
          );
        } else if (triggerOp === 'processed' || triggerOp === 'invocation') {
          // FIXME: temp solution
          filteredData = data.events.filter(
            (row: { status?: string }) => row?.status === 'delivered'
          );
        }
        setRows(filteredData);
        setLoading(false);
        if (offset !== undefined) {
          setState(s => ({ ...s, offset }));
        }
        if (limit !== undefined) {
          setState(s => ({ ...s, limit }));
        }
        if (newSorts) {
          setState(s => ({
            ...s,
            sorts: newSorts,
          }));
        }
        setCount(filteredData.length);
      },
      () => {
        setError(true);
        setLoading(false);
      }
    );
  };

  React.useEffect(() => {
    runQuery();
  }, []);

  const setter: SetFilterState = {
    sorts: (sorts: OrderBy[]) => {
      const newSorts = [...sorts];
      if (!sorts.length || sorts[sorts.length - 1].column) {
        newSorts.push(defaultSort);
      }
      setState(s => ({
        ...s,
        sorts: newSorts,
      }));
    },
    filters: (filters: ValueFilter[]) => {
      const newFilters = [...filters];
      if (
        !filters.length ||
        filters[filters.length - 1].value ||
        filters[filters.length - 1].key
      ) {
        newFilters.push(defaultFilter);
      }
      setState(s => ({
        ...s,
        filters: newFilters,
      }));
    },
    offset: (o: number) => {
      setState(s => ({
        ...s,
        offset: o,
      }));
    },
    limit: (l: number) => {
      setState(s => ({
        ...s,
        limit: l,
      }));
    },
  };

  return {
    rows,
    loading,
    error,
    runQuery,
    state,
    count,
    setState: setter,
  };
};
