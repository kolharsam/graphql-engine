import React from 'react';
import { connect, MapStateToProps, ConnectedProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import { OrderBy } from '../utils/v1QueryUtils';
import Where from './Where';
import Sorts from './Sorts';
import { useFilterQuery } from './state';
import { Filter, FilterRenderProp } from './types';
import { ReduxState } from '../../../types';
import ReloadEnumValuesButton from '../../Services/Data/Common/Components/ReloadEnumValuesButton';
import Button from '../Button/Button';
import { Nullable } from '../utils/tsUtils';
import styles from './FilterQuery.scss';
import { BaseTable } from '../../../dataSources/types';
import { generateTableDef } from '../../../dataSources';
import { mapDispatchToPropsEmpty } from '../utils/reactUtils';

interface Props extends InjectedProps {
  table: BaseTable;
  relationships: Nullable<string[]>; // TODO better
  render: FilterRenderProp;
  presets: {
    filters: Filter[];
    sorts: OrderBy[];
  };
}

/*
 * Where clause and sorts builder
 * Accepts a render prop to render the results of filter/sort query
 */

const FilterQuery: React.FC<Props> = props => {
  const {
    table,
    dispatch,
    presets,
    render,
    relationships,
    triggerName,
    currentSource,
  } = props;

  const { rows, count, runQuery, state, setState } = useFilterQuery(
    generateTableDef(table.table_name, table.table_schema),
    dispatch,
    presets,
    relationships,
    triggerName,
    currentSource
  );

  return (
    <div className={styles.add_mar_top}>
      <form
        onSubmit={e => {
          e.preventDefault();
          runQuery();
        }}
        className={styles.add_mar_bottom}
      >
        <div>
          <div
            className={`${styles.queryBox} col-xs-6 ${styles.padd_left_remove}`}
          >
            <span className={styles.subheading_text}>Filter</span>
            <Where
              filters={state.filters}
              setFilters={setState.filters}
              table={table}
            />
          </div>
          <div
            className={`${styles.queryBox} col-xs-6 ${styles.padd_left_remove}`}
          >
            <b className={styles.subheading_text}>Sort</b>
            <Sorts
              sorts={state.sorts}
              setSorts={setState.sorts}
              table={table}
            />
          </div>
        </div>
        <div className={`${styles.padd_right} ${styles.clear_fix}`}>
          <Button
            type="submit"
            color="yellow"
            size="sm"
            data-test="run-query"
            className={styles.add_mar_right}
          >
            Run query
          </Button>
          <ReloadEnumValuesButton
            dispatch={dispatch}
            isEnum={!!table.is_enum}
            tooltipStyle={styles.add_mar_left_mid}
          />
          {/* <div className={styles.count + ' alert alert-info'}><i>Total <b>{tableName}</b> rows in the database for current query: {count} </i></div> */}
        </div>
      </form>
      {/* TODO: Handle loading state */}
      {render(rows, count, state, setState, runQuery)}
    </div>
  );
};

type ExternalProps = RouteComponentProps<
  {
    triggerName: string;
  },
  unknown
>;

type PropsFromState = {
  currentSource?: string;
  triggerName?: string;
};

const mapStateToProps = (state: ReduxState, ownProps: ExternalProps) => ({
  triggerName: ownProps.params.triggerName,
  currentSource: state.tables.currentDataSource,
});

const connector = connect(mapStateToProps, mapDispatchToPropsEmpty);
type InjectedProps = ConnectedProps<typeof connector>;

const FilterQueryConnector = compose(withRouter, connector)(FilterQuery);
export default FilterQueryConnector;
