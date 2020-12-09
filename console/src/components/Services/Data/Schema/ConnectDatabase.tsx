import React, { ChangeEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Helmet from 'react-helmet';

import { ReduxState } from '../../../../types';
import { mapDispatchToPropsEmpty } from '../../../Common/utils/reactUtils';
import { RightContainer } from '../../../Common/Layout/RightContainer';
import BreadCrumb from '../../../Common/Layout/BreadCrumb/BreadCrumb';
import { Driver } from '../../../../dataSources';
import Button from '../../../Common/Button';

import styles from '../../../Common/Common.scss';
import ToolTip from '../../../Common/Tooltip/Tooltip';

interface ConnectDatabaseProps extends InjectedProps {}

const connectionRadioName = 'connection-type';
const defaultPGURL = "postgres://username:password@hostname:5432/database";
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

type ConnectionSettings = {
  maxConnections?: number;
  idleTimeout?: number;
  retries?: number;
};

type ConnectDBState = {
  displayName: string;
  dbType: Driver;
  connectionParamState: {
    host: string;
    port: string;
    username: string;
    password: string;
  };
  databaseURLState: {
    dbURL: string;
  };
  envVarURLState: {
    envVarURL: string;
  };
  connectionSettings?: ConnectionSettings;
};

const defaultState: ConnectDBState = {
  displayName: '',
  dbType: 'postgres',
  connectionParamState: {
    host: '',
    port: '',
    username: '',
    password: '',
  },
  databaseURLState: {
    dbURL: '',
  },
  envVarURLState: {
    envVarURL: '',
  },
};

const UPDATE_DISPLAY_NAME = 'update_display_name';
const UPDATE_DB_DRIVER = 'update_db_driver';
const UPDATE_DB_URL = 'update_db_url';
const UPDATE_DB_URL_ENV_VAR = 'update_db_url_env_var';
const UPDATE_DB_HOST = 'update_db_host';
const UPDATE_DB_PORT = 'update_db_port';
const UPDATE_DB_USERNAME = 'update_db_username';
const UPDATE_DB_PASSWORD = 'update_db_password';
// TODO: add actions for the connection settings as well
// const UPDATE_

const ConnectDatabase: React.FC<ConnectDatabaseProps> = props => {
  const connectDBReducer = (
    state: ConnectDBState,
    action: { type: string; data: any }
  ): ConnectDBState => {
    switch (action.type) {
      case UPDATE_DISPLAY_NAME:
        return {
          ...state,
          displayName: action.data,
        };
      case UPDATE_DB_DRIVER:
        return {
          ...state,
          dbType: action.data,
        };
      case UPDATE_DB_URL:
        return {
          ...state,
          databaseURLState: {
            dbURL: action.data,
          },
        };
      case UPDATE_DB_URL_ENV_VAR:
        return {
          ...state,
          envVarURLState: {
            envVarURL: action.data,
          },
        };
      case UPDATE_DB_HOST:
        return {
          ...state,
          connectionParamState: {
            ...state.connectionParamState,
            host: action.data,
          },
        };
      case UPDATE_DB_PORT:
        return {
          ...state,
          connectionParamState: {
            ...state.connectionParamState,
            port: action.data,
          },
        };
      case UPDATE_DB_USERNAME:
        return {
          ...state,
          connectionParamState: {
            ...state.connectionParamState,
            username: action.data,
          },
        };
      case UPDATE_DB_PASSWORD:
        return {
          ...state,
          connectionParamState: {
            ...state.connectionParamState,
            password: action.data,
          },
        };
      default:
        return state;
    }
  };

  const [connectDBInputState, connectDBDispatch] = React.useReducer(
    connectDBReducer,
    defaultState
  );
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
      <Helmet title="Connect Database - Hasura" />
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
          <div className={styles.connect_form_layout}>
            <label className={styles.connect_db_input_label}>
              Database Name
            </label>
            <input
              key="connect-display-name"
              type="text"
              onChange={e =>
                connectDBDispatch({
                  type: UPDATE_DISPLAY_NAME,
                  data: e.target.value,
                })
              }
              value={connectDBInputState.displayName}
              className={`form-control ${styles.connect_db_input_pad}`}
              placeholder="Database Name"
            />
            <label className={styles.connect_db_input_label}>
              Data Source Driver
            </label>
            <select
              key="connect-db-type"
              value={connectDBInputState.dbType}
              onChange={e => {
                connectDBDispatch({
                  type: UPDATE_DB_DRIVER,
                  data: e.target.value,
                });
              }}
              className={`form-control ${styles.connect_db_input_pad}`}
            >
              <option value="postgres">Postgres</option>
              <option value="mysql">MySQL</option>
            </select>
            {connectionType === connectionTypes.DATABASE_URL ? (
              <>
                <label className={styles.connect_db_input_label}>
                  Database URL
                </label>
                <input
                  key="connect-db-url"
                  type="text"
                  onChange={e =>
                    connectDBDispatch({
                      type: UPDATE_DB_URL,
                      data: e.target.value,
                    })
                  }
                  value={connectDBInputState.databaseURLState.dbURL}
                  className={`form-control ${styles.connect_db_input_pad}`}
                  placeholder={defaultPGURL}
                />
              </>
            ) : null}
            {connectionType === connectionTypes.ENV_VAR ? (
              <>
                <label className={styles.connect_db_input_label}>
                  Environment Variable
                  <ToolTip message="Should be a valid database connection string" placement="right" />
                </label>
                <input
                  key="connect-db-env-url"
                  type="text"
                  placeholder={defaultPGURL}
                  onChange={e =>
                    connectDBDispatch({
                      type: UPDATE_DB_URL_ENV_VAR,
                      data: e.target.value,
                    })
                  }
                  value={connectDBInputState.envVarURLState.envVarURL}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
              </>
            ) : null}
            {connectionType === connectionTypes.CONNECTION_PARAMS ? (
              <>
                <label className={styles.connect_db_input_label}>
                  Host
                </label>
                <input
                  key="connect-db-host-name"
                  type="text"
                  placeholder="localhost"
                  onChange={e =>
                    connectDBDispatch({
                      type: UPDATE_DB_HOST,
                      data: e.target.value,
                    })
                  }
                  value={connectDBInputState.connectionParamState.host}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
                <label className={styles.connect_db_input_label}>
                  Port
                </label>
                <input
                  key="connect-db-port"
                  type="text"
                  placeholder="5432"
                  onChange={e =>
                    connectDBDispatch({
                      type: UPDATE_DB_PORT,
                      data: e.target.value,
                    })
                  }
                  value={connectDBInputState.connectionParamState.port}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
                <label className={styles.connect_db_input_label}>
                  Username
                </label>
                <input
                  key="connect-db-username"
                  type="text"
                  placeholder="postgres"
                  onChange={e =>
                    connectDBDispatch({
                      type: UPDATE_DB_USERNAME,
                      data: e.target.value,
                    })
                  }
                  value={connectDBInputState.connectionParamState.username}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
                <label className={styles.connect_db_input_label}>
                  Password
                </label>
                <input
                  key="connect-db-password"
                  type="password"
                  placeholder="postgres"
                  onChange={e =>
                    connectDBDispatch({
                      type: UPDATE_DB_PASSWORD,
                      data: e.target.value,
                    })
                  }
                  value={connectDBInputState.connectionParamState.password}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
              </>
            ) : null}
            <div className={styles.add_button_layout}>
              <Button
                onClick={() => {
                  // TODO: add the functionality here
                  console.log({ connectDBInputState });
                }}
                size="large"
                color="yellow"
                style={{
                  width: '28%',
                }}
              >
                Connect Database
              </Button>
            </div>
          </div>
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
