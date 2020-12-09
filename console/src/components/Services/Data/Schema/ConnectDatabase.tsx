import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Helmet from 'react-helmet';

import { ReduxState } from '../../../../types';
import { getDataSources } from '../../../../metadata/selector';
import { mapDispatchToPropsEmpty } from '../../../Common/utils/reactUtils';
import { RightContainer } from '../../../Common/Layout/RightContainer';

import styles from '../../../Common/Common.scss';
import BreadCrumb from '../../../Common/Layout/BreadCrumb/BreadCrumb';

interface ConnectDatabaseProps extends InjectedProps {}

const ConnectDatabase: React.FC<ConnectDatabaseProps> = props => {
  const crumbs = [
    {
      title: 'Data',
      url: `/data/${props.currentDataSource}/schema/${props.currentSchema}`,
    },
    {
      title: 'Manage Databases',
      url: '/data/manage',
    },
    {
      title: 'Connect Database',
      url: '#',
    },
  ];

  return (
    <RightContainer>
      <Helmet title="Connect DB - Hasura" />
      <div className={`container-fluid ${styles.manage_dbs_page}`}>
        <BreadCrumb breadCrumbs={crumbs} />
        <div className={styles.padd_top}>
          <div className={`${styles.display_flex} manage-db-header`}>
            <h2 className={`${styles.headerText} ${styles.display_inline}`}>
              Connect Database
            </h2>
          </div>
        </div>
        <hr />
        <div className={styles.connect_db_content}>
          <h4 className={`${styles.remove_pad_bottom} ${styles.connect_db_header}`}>
            Connect Database Via
          </h4>
          {/* TODO: add form here */}
        </div>
      </div>
    </RightContainer>
  );
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
