import React, { ChangeEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Helmet from 'react-helmet';

import { ReduxState, Dispatch } from '../../../../types';
import { mapDispatchToPropsEmpty } from '../../../Common/utils/reactUtils';
import { RightContainer } from '../../../Common/Layout/RightContainer';
import BreadCrumb from '../../../Common/Layout/BreadCrumb/BreadCrumb';
import { Driver } from '../../../../dataSources';
import Button from '../../../Common/Button';
import ToolTip from '../../../Common/Tooltip/Tooltip';
import styles from '../../../Common/Common.scss';
import { showErrorNotification } from '../../Common/Notification';
import { makeConnectionStringFromConnectionParams } from './ManageDBUtils';
import { addDataSource, editDataSource } from '../../../../metadata/actions';
import _push from '../push';

interface ConnectDatabaseProps extends InjectedProps {}

const connectionRadioName = 'connection-type';
const defaultPGURL = 'postgresql://username:password@hostname:5432/database';
const connectionTypes = {
  DATABASE_URL: 'DATABASE_URL',
  CONNECTION_PARAMS: 'CONNECTION_PARAMETERS',
  ENV_VAR: 'ENVIRONMENT_VARIABLES',
};

const connectionRadios = [
  {
    value: connectionTypes.CONNECTION_PARAMS,
    title: 'Connection Parameters',
    disableOnEdit: true,
  },
  {
    value: connectionTypes.DATABASE_URL,
    title: 'Database URL',
    disableOnEdit: false,
  },
  {
    value: connectionTypes.ENV_VAR,
    title: 'Environment Variable',
    disableOnEdit: true,
  },
];

type ConnectionSettings = {
  max_connections?: number;
  idle_timeout?: number;
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
    database: string;
  };
  databaseURLState: {
    dbURL: string;
  };
  envVarURLState: {
    envVarURL: string;
  };
  connectionSettings: ConnectionSettings;
};

const defaultState: ConnectDBState = {
  displayName: '',
  dbType: 'postgres',
  connectionParamState: {
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
  },
  databaseURLState: {
    dbURL: '',
  },
  envVarURLState: {
    envVarURL: '',
  },
  connectionSettings: {},
};

const UPDATE_DISPLAY_NAME = 'update_display_name';
const UPDATE_DB_DRIVER = 'update_db_driver';
const UPDATE_DB_URL = 'update_db_url';
const UPDATE_DB_URL_ENV_VAR = 'update_db_url_env_var';
const UPDATE_DB_HOST = 'update_db_host';
const UPDATE_DB_PORT = 'update_db_port';
const UPDATE_DB_USERNAME = 'update_db_username';
const UPDATE_DB_PASSWORD = 'update_db_password';
const UDPATE_DB_DATABASE_NAME = 'update_db_database_name';
const RESET_INPUT_STATE = 'reset_input_state';
const UPDATE_MAX_CONNECTIONS = 'update_max_connections';
const UDPATE_IDLE_TIMEOUT = 'update_idle_timeout';
const UPDATE_RETRIES = 'update_retries';
const UPDATE_CONNECTION_SETTINGS = 'update_connection_settings';

const getErrorMessageFromMissingFields = (
  host: string,
  port: string,
  username: string,
  database: string
) => {
  const missingFields = [];
  if (!host) {
    missingFields.push('host');
  }
  if (!port) {
    missingFields.push('port');
  }
  if (!username) {
    missingFields.push('username');
  }
  if (!database) {
    missingFields.push('database');
  }

  return `The following fields are required: ${missingFields
    .slice(0, missingFields.length - 1)
    .join(', ')} and ${missingFields[missingFields.length - 1]}.`;
};

const setNumberFromString = (str: string) => {
  return parseInt(str.trim(), 10);
};

const connectDataSource = (
  dispatch: Dispatch,
  typeConnection: string,
  currentState: ConnectDBState,
  cb: () => void
) => {
  let databaseURL = currentState.databaseURLState.dbURL.trim();
  if (typeConnection === connectionTypes.ENV_VAR) {
    databaseURL = currentState.envVarURLState.envVarURL.trim();
  } else if (typeConnection === connectionTypes.CONNECTION_PARAMS) {
    const {
      host,
      port,
      username,
      database,
      password,
    } = currentState.connectionParamState;
    databaseURL = makeConnectionStringFromConnectionParams(
      currentState.dbType,
      host,
      port,
      username,
      database,
      password
    );
  }

  dispatch(
    addDataSource(
      {
        driver: currentState.dbType,
        payload: {
          name: currentState.displayName.trim(),
          dbUrl: databaseURL,
          connection_pool_settings: currentState.connectionSettings,
        },
      },
      cb
    )
  );
};

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
      case UDPATE_DB_DATABASE_NAME:
        return {
          ...state,
          connectionParamState: {
            ...state.connectionParamState,
            database: action.data,
          },
        };
      case RESET_INPUT_STATE:
        return {
          ...defaultState,
        };
      case UPDATE_MAX_CONNECTIONS:
        return {
          ...state,
          connectionSettings: {
            ...state.connectionSettings,
            max_connections: setNumberFromString(action.data),
          },
        };
      case UPDATE_RETRIES:
        return {
          ...state,
          connectionSettings: {
            ...state.connectionSettings,
            retries: setNumberFromString(action.data),
          },
        };
      case UDPATE_IDLE_TIMEOUT:
        return {
          ...state,
          connectionSettings: {
            ...state.connectionSettings,
            idle_timeout: setNumberFromString(action.data),
          },
        };
      case UPDATE_CONNECTION_SETTINGS:
        return {
          ...state,
          connectionSettings: action.data,
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
  const [openConnectionSettings, changeConnectionsParamState] = React.useState(
    false
  );
  const isEditState =
    window.location.pathname.includes('edit') ||
    window.location.pathname.indexOf('edit') !== -1;
  const paths = window.location.pathname.split('/');
  const editSourceName = paths[paths.length - 1];
  const currentSourceInfo = props.sources.find(
    source => source.name === editSourceName
  );
  const oldName = currentSourceInfo?.name;

  // If we're in the editing state, then we need to
  // make sure that the already known values are in
  // place for the editing state
  React.useEffect(() => {
    if (isEditState && currentSourceInfo) {
      connectDBDispatch({
        type: UPDATE_DISPLAY_NAME,
        data: currentSourceInfo.name,
      });
      connectDBDispatch({
        type: UPDATE_DB_DRIVER,
        data: currentSourceInfo.kind ?? 'postgres',
      });
      connectDBDispatch({
        type: UPDATE_DB_URL,
        data: currentSourceInfo?.configuration?.database_url,
      });
      connectDBDispatch({
        type: UPDATE_CONNECTION_SETTINGS,
        data: currentSourceInfo.configuration?.connection_pool_settings ?? {},
      });
    }
  }, [isEditState, currentSourceInfo]);

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

  const { dispatch } = props;

  const resetState = () => {
    connectDBDispatch({
      type: RESET_INPUT_STATE,
      data: null,
    });
  };

  const onClickConnectDatabase = () => {
    if (!connectDBInputState.displayName.trim()) {
      dispatch(
        showErrorNotification(
          'Display Name is a mandatory field',
          'Please enter a valid display name.'
        )
      );
      return;
    }

    if (isEditState) {
      dispatch(
        editDataSource(
          oldName,
          {
            driver: connectDBInputState.dbType,
            payload: {
              name: connectDBInputState.displayName.trim(),
              dbUrl: connectDBInputState.databaseURLState.dbURL,
              connection_pool_settings: connectDBInputState.connectionSettings,
            },
          },
          () => {
            resetState();
            dispatch(_push('/data/manage'));
          }
        )
      );
      return;
    }

    if (connectionType === connectionTypes.DATABASE_URL) {
      if (!connectDBInputState.databaseURLState.dbURL.trim()) {
        dispatch(
          showErrorNotification(
            'Database URL is a mandatory field',
            'Please enter a valid database URL'
          )
        );
        return;
      }

      connectDataSource(
        dispatch,
        connectionType,
        connectDBInputState,
        resetState
      );
      return;
    }

    if (connectionType === connectionTypes.ENV_VAR) {
      if (!connectDBInputState.databaseURLState.dbURL.trim()) {
        dispatch(
          showErrorNotification(
            'Environment Variable is a mandatory field',
            'Please enter the name of a valid environment variable'
          )
        );
        return;
      }

      connectDataSource(
        dispatch,
        connectionType,
        connectDBInputState,
        resetState
      );
      return;
    }

    // construct the connection string from connection params and
    // make the same call as done for connection of type DATABASE_URL
    const {
      host,
      port,
      username,
      database,
    } = connectDBInputState.connectionParamState;

    if (!host || !port || !username || !database) {
      const errorMessage = getErrorMessageFromMissingFields(
        host,
        port,
        username,
        database
      );
      dispatch(
        showErrorNotification('Some required fields are missing', errorMessage)
      );
      return;
    }
    connectDataSource(
      dispatch,
      connectionType,
      connectDBInputState,
      resetState
    );
  };

  const onChangeConnectionInput = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    connectDBDispatch({
      type: e.target.name,
      data: e.target.value,
    });
  };

  return (
    <RightContainer>
      <Helmet
        title={
          isEditState ? 'Edit Database - Hasura' : 'Connect Database - Hasura'
        }
      />
      <div className={`container-fluid ${styles.manage_dbs_page}`}>
        <BreadCrumb breadCrumbs={crumbs} />
        <div className={styles.padd_top}>
          <div className={`${styles.display_flex} manage-db-header`}>
            <h2 className={`${styles.headerText} ${styles.display_inline}`}>
              {isEditState ? 'Edit Connection' : 'Connect Database'}
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
              (radioBtn: {
                value: string;
                title: string;
                disableOnEdit: boolean;
              }) => (
                <label className={styles.connect_db_radio_label}>
                  <input
                    type="radio"
                    value={radioBtn.value}
                    name={connectionRadioName}
                    checked={connectionType === radioBtn.value}
                    disabled={
                      isEditState === radioBtn.disableOnEdit && isEditState
                    }
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
              name={UPDATE_DISPLAY_NAME}
              onChange={onChangeConnectionInput}
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
              name={UPDATE_DB_DRIVER}
              onChange={onChangeConnectionInput}
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
                  name={UPDATE_DB_URL}
                  onChange={onChangeConnectionInput}
                  value={connectDBInputState.databaseURLState.dbURL}
                  className={`form-control ${styles.connect_db_input_pad}`}
                  placeholder={defaultPGURL}
                  disabled={isEditState}
                />
              </>
            ) : null}
            {connectionType === connectionTypes.ENV_VAR ? (
              <>
                <label className={styles.connect_db_input_label}>
                  Environment Variable
                  <ToolTip
                    message="Should be a valid database connection string"
                    placement="right"
                  />
                </label>
                <input
                  key="connect-db-env-url"
                  type="text"
                  placeholder={defaultPGURL}
                  name={UPDATE_DB_URL_ENV_VAR}
                  onChange={onChangeConnectionInput}
                  value={connectDBInputState.envVarURLState.envVarURL}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
              </>
            ) : null}
            {connectionType === connectionTypes.CONNECTION_PARAMS ? (
              <>
                <label className={styles.connect_db_input_label}>Host</label>
                <input
                  key="connect-db-host-name"
                  type="text"
                  placeholder="localhost"
                  name={UPDATE_DB_HOST}
                  onChange={onChangeConnectionInput}
                  value={connectDBInputState.connectionParamState.host}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
                <label className={styles.connect_db_input_label}>Port</label>
                <input
                  key="connect-db-port"
                  type="text"
                  placeholder="5432"
                  name={UPDATE_DB_PORT}
                  onChange={onChangeConnectionInput}
                  value={connectDBInputState.connectionParamState.port}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
                <label className={styles.connect_db_input_label}>
                  Username
                </label>
                <input
                  key="connect-db-username"
                  type="text"
                  placeholder="postgres_user"
                  name={UPDATE_DB_USERNAME}
                  onChange={onChangeConnectionInput}
                  value={connectDBInputState.connectionParamState.username}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
                <label className={styles.connect_db_input_label}>
                  Password
                </label>
                <input
                  key="connect-db-password"
                  type="password"
                  placeholder="postgrespassword"
                  name={UPDATE_DB_PASSWORD}
                  onChange={onChangeConnectionInput}
                  value={connectDBInputState.connectionParamState.password}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
                <label className={styles.connect_db_input_label}>
                  Database
                </label>
                <input
                  key="connect-db-database-name"
                  type="text"
                  placeholder="postgres"
                  name={UDPATE_DB_DATABASE_NAME}
                  onChange={onChangeConnectionInput}
                  value={connectDBInputState.connectionParamState.database}
                  className={`form-control ${styles.connect_db_input_pad}`}
                />
              </>
            ) : null}
            <div className={styles.connection_settings_layout}>
              <div className={styles.connection_settings_header}>
                <a
                  href="#"
                  style={{ textDecoration: 'none' }}
                  onClick={() =>
                    changeConnectionsParamState(!openConnectionSettings)
                  }
                >
                  {openConnectionSettings ? (
                    <i className="fa fa-caret-down" />
                  ) : (
                    <i className="fa fa-caret-right" />
                  )}
                  {'  '}
                  Connection Settings
                </a>
              </div>
              {openConnectionSettings ? (
                <div className={styles.connection_settings_form}>
                  <div
                    className={styles.connnection_settings_form_input_layout}
                  >
                    <label>
                      <b>Max Connections</b>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${styles.connnection_settings_form_input}`}
                      placeholder="50"
                      value={
                        connectDBInputState.connectionSettings
                          ?.max_connections ?? undefined
                      }
                      name={UPDATE_MAX_CONNECTIONS}
                      onChange={onChangeConnectionInput}
                      min="0"
                    />
                  </div>
                  <div
                    className={styles.connnection_settings_form_input_layout}
                  >
                    <label>
                      <b>Idle Timeout</b>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${styles.connnection_settings_form_input}`}
                      placeholder="180"
                      value={
                        connectDBInputState.connectionSettings?.idle_timeout ??
                        undefined
                      }
                      name={UDPATE_IDLE_TIMEOUT}
                      onChange={onChangeConnectionInput}
                      min="0"
                    />
                  </div>
                  <div
                    className={styles.connnection_settings_form_input_layout}
                  >
                    <label>
                      <b>Retries</b>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${styles.connnection_settings_form_input}`}
                      placeholder="1"
                      value={
                        connectDBInputState.connectionSettings?.retries ??
                        undefined
                      }
                      name={UPDATE_RETRIES}
                      onChange={onChangeConnectionInput}
                      min="0"
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles.add_button_layout}>
              <Button
                onClick={onClickConnectDatabase}
                size="large"
                color="yellow"
                style={{
                  width: '70%',
                }}
              >
                {!isEditState ? 'Connect Database' : 'Edit Connection'}
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
    sources: state.metadata.metadataObject?.sources ?? [],
  };
};

const connector = connect(mapStateToProps, mapDispatchToPropsEmpty);
type InjectedProps = ConnectedProps<typeof connector>;
const ConnectedDatabaseConnectPage = connector(ConnectDatabase);
export default ConnectedDatabaseConnectPage;
