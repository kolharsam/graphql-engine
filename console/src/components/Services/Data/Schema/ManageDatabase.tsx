import React, { useState } from 'react';
import Helmet from 'react-helmet';
import { connect, ConnectedProps } from 'react-redux';

import Button from '../../../Common/Button/Button';
import styles from '../../../Common/Common.scss';
import { FixMe, ReduxState } from '../../../../types';
import BreadCrumb from '../../../Common/Layout/BreadCrumb/BreadCrumb';
// import AddDataSource from './AddDataSource';
import { DataSource } from '../../../../metadata/types';
import { Driver } from '../../../../dataSources';
import {
  removeDataSource,
  reloadDataSource,
  // addDataSource,
} from '../../../../metadata/actions';
import { RightContainer } from '../../../Common/Layout/RightContainer';
import { getDataSources } from '../../../../metadata/selector';
import ToolTip from '../../../Common/Tooltip/Tooltip';
import { getConfirmation } from '../../../Common/utils/jsUtils';
import { mapDispatchToPropsEmpty } from '../../../Common/utils/reactUtils';

type DatabaseListItemProps = {
  dataSource: DataSource;
  onReload: (name: string, driver: Driver, cb: () => void) => void;
  onRemove: (name: string, driver: Driver, cb: () => void) => void;
};
const DatabaseListItem: React.FC<DatabaseListItemProps> = ({
  onReload,
  onRemove,
  dataSource,
}) => {
  const [reloading, setReloading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showUrl, setShowUrl] = useState(dataSource.name === 'default');

  return (
    <div className={styles.db_list_item}>
      <div className={styles.db_item_actions}>
        <Button
          size="xs"
          color="white"
          onClick={() => {
            setReloading(true);
            onReload(dataSource.name, dataSource.driver, () =>
              setReloading(false)
            );
          }}
        >
          {reloading ? 'Reloading...' : 'Reload'}
        </Button>
        {dataSource.name !== 'default' && (
          <Button
            className={`${styles.db_list_content} ${styles.text_red}`}
            size="xs"
            color="white"
            onClick={() => {
              setRemoving(true);
              onRemove(dataSource.name, dataSource.driver, () =>
                setRemoving(false)
              );
            }}
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        )}
      </div>
      <div className={styles.db_list_content}>
        <div className={styles.db_display_data}>
          <div className={styles.displayFlexContainer}>
            <b>{dataSource.name}</b>&nbsp;<p>({dataSource.driver})</p>
          </div>
          {/* TODO: Once host related info is added, it can added here */}
          <p style={{ marginTop: -5 }}>host</p>
        </div>
        <span style={{ paddingLeft: 125 }}>
          {showUrl ? (
            typeof dataSource.url === 'string' ? (
              dataSource.url
            ) : (
              dataSource.url.from_env
            )
          ) : (
            <ToolTip
              id="connection-string-show"
              placement="right"
              message="Show connection string"
            >
              <div className={styles.show_connection_string} onClick={() => setShowUrl(true)}>
                <i
                  className={`${styles.showAdminSecret} fa fa-eye`}
                  aria-hidden="true"
                />
                <p style={{ marginLeft: 6 }}>Show Connection String</p>
              </div>
            </ToolTip>
          )}
          {showUrl && dataSource.name !== 'default' && (
            <ToolTip
              id="connection-string-hide"
              placement="right"
              message="Hide connection string"
            >
              <i
                className={`${styles.closeHeader} fa fa-times`}
                aria-hidden="true"
                onClick={() => setShowUrl(false)}
                style={{ paddingLeft: 10 }}
              />
            </ToolTip>
          )}
        </span>
      </div>
    </div>
  );
};

interface ManageDatabaseProps extends InjectedProps {}

const ManageDatabase: React.FC<ManageDatabaseProps> = ({
  dataSources,
  dispatch,
  ...props
}) => {
  const crumbs = [
    {
      title: 'Data',
      url: `/data/${props.currentDataSource}/schema/${props.currentSchema}`,
    },
    {
      title: 'Manage',
      url: '#',
    },
  ];

  const onRemove = (name: string, driver: Driver, cb: () => void) => {
    const confirmation = getConfirmation(
      `Your action will remove the "${name}" data source`,
      true,
      name
    );
    if (confirmation) {
      (dispatch(removeDataSource({ driver, name })) as FixMe).then(cb);
    }
  };

  const onReload = (name: string, driver: Driver, cb: () => void) => {
    (dispatch(reloadDataSource({ driver, name })) as FixMe).then(cb);
  };

  // const onSubmitAddDataSource = (
  //   data: DataSource,
  //   successCallback: () => void
  // ) => {
  //   dispatch(
  //     addDataSource(
  //       {
  //         driver: data.driver,
  //         payload: {
  //           name: data.name.trim(),
  //           connection_pool_settings: {
  //             ...(data.connection_pool_settings?.idle_timeout && {
  //               idle_timeout: data.connection_pool_settings.idle_timeout,
  //             }),
  //             ...(data.connection_pool_settings?.max_connections && {
  //               max_connections: data.connection_pool_settings.max_connections,
  //             }),
  //             ...(data.connection_pool_settings?.retries && {
  //               retries: data.connection_pool_settings.retries,
  //             }),
  //           },
  //           dbUrl: typeof data.url === 'string' ? data.url : data.url.from_env,
  //         },
  //       },
  //       successCallback
  //     )
  //   );
  // };

  const onClickConnectDB = () => {
    // TODO: push to new route
  };

  return (
    <RightContainer>
      <Helmet title="Manage - Data | Hasura" />
      <div className={`container-fluid ${styles.manage_dbs_page}`}>
        <BreadCrumb breadCrumbs={crumbs} />
        <div className={styles.padd_top}>
          <div className={`${styles.display_flex} manage-db-header`}>
            <h2
              className={`${styles.headerText} ${styles.display_inline}`}
            >
              Manage Databases
            </h2>
            <Button color="yellow" size="md" className={styles.add_mar_left} onClick={onClickConnectDB}>
              Connect Database
            </Button>
          </div>
        </div>
        <div className={styles.manage_db_content}>
          <hr />
          <h3 className={`${styles.heading_text} ${styles.remove_pad_bottom}`}>
            Databases
          </h3>
          <div className={styles.data_list_container}>
            {dataSources.length ? (
              dataSources.map(data => (
                <DatabaseListItem
                  key={data.name}
                  dataSource={data}
                  onReload={onReload}
                  onRemove={onRemove}
                />
              ))
            ) : (
              <span style={{ paddingTop: 15 }}>
                You don&apos;t have any data sources
              </span>
            )}
          </div>
          <hr />
        </div>
        {/* <AddDataSource onSubmit={onSubmitAddDataSource} /> */}
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
const ConnectedDatabaseManagePage = connector(ManageDatabase);
export default ConnectedDatabaseManagePage;
