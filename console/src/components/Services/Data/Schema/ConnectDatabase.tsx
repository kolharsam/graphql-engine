import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { ReduxState } from '../../../../types';
import { getDataSources } from '../../../../metadata/selector';
import { mapDispatchToPropsEmpty } from '../../../Common/utils/reactUtils';

const ConnectDatabase = () => {
    return <>Hello</>;
};

const mapStateToProps = (state: ReduxState) => {
    return {
      schemaList: state.tables.schemaList,
      dataSources: getDataSources(state),
      currentDataSource: state.tables.currentDataSource,
      currentSchema: state.tables.currentSchema,
    };
  };
  
  const connector = connect(mapStateToProps, mapDispatchToPropsEmpty);
  type InjectedProps = ConnectedProps<typeof connector>;
  const ConnectedDatabaseConnectPage = connector(ConnectDatabase);
  export default ConnectedDatabaseConnectPage;
