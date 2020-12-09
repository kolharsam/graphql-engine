import React, { ChangeEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Helmet from 'react-helmet';

import { ReduxState } from '../../../../types';
import { mapDispatchToPropsEmpty } from '../../../Common/utils/reactUtils';
import { RightContainer } from '../../../Common/Layout/RightContainer';
import BreadCrumb from '../../../Common/Layout/BreadCrumb/BreadCrumb';

import styles from '../../../Common/Common.scss';

interface ConnectDatabaseProps extends InjectedProps {}

const connectionRadioName = 'connection-type';

const connectionTypes = {
  DATABASE_URL: 'DATABASE_URL',
  CONNECTION_PARAMS: 'CONNECTION_PARAMETERS',
  ENV_VAR: 'ENVIRONMENT_VARIABLES',
};

const connectionRadios = [
  {
    value: connectionTypes.CONNECTION_PARAMS,
    title: 'Connection Parameters',
  },
  {
    value: connectionTypes.DATABASE_URL,
    title: 'Database URL',
  },
  {
    value: connectionTypes.ENV_VAR,
    title: 'Environment Variable',
  },
];

const ConnectDatabase: React.FC<ConnectDatabaseProps> = props => {
  const [connectionType, changeConnectionType] = React.useState(
    connectionTypes.DATABASE_URL
  );
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

  const onChangeConnectionType = (e: ChangeEvent<HTMLInputElement>) => {
    changeConnectionType(e.target.value);
  };

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
          <h4
            className={`${styles.remove_pad_bottom} ${styles.connect_db_header}`}
          >
            Connect Database Via
          </h4>
          <div
            className={styles.connect_db_radios}
            onChange={onChangeConnectionType}
          >
            {connectionRadios.map(
              (radioBtn: { value: string; title: string }) => (
                <label className={styles.connect_db_radio_label}>
                  <input
                    type="radio"
                    value={radioBtn.value}
                    name={connectionRadioName}
                    checked={connectionType === radioBtn.value}
                  />
                  {radioBtn.title}
                </label>
              )
            )}
          </div>
          {/* TODO: add form(s) here */}
          <div className={styles.connect_form_layout}>{connectionType}</div>
        </div>
      </div>
    </RightContainer>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    currentDataSource: state.tables.currentDataSource,
    currentSchema: state.tables.currentSchema,
  };
};

const connector = connect(mapStateToProps, mapDispatchToPropsEmpty);
type InjectedProps = ConnectedProps<typeof connector>;
const ConnectedDatabaseConnectPage = connector(ConnectDatabase);
export default ConnectedDatabaseConnectPage;
