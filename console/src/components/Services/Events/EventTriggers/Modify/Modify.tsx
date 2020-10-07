import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import TableHeader from '../TableCommon/TableHeader';
import styles from './ModifyEvent.scss';
import { updateSchemaInfo } from '../../../Data/DataActions';
import Button from '../../../../Common/Button/Button';
import { useEventTriggerModify } from '../state';

import Info from './Info';
import WebhookEditor from './WebhookEditor';
import OperationEditor from './OperationEditor';
import RetryConfEditor from './RetryConfEditor';
import HeadersEditor from './HeadersEditor';
import { ReduxState } from '../../../../../types';
import { RouterTriggerProps } from '../../types';
import { findETTable } from '../../utils';
import { EventTriggerProperty } from './utils';
import { mapDispatchToPropsEmpty } from '../../../../Common/utils/reactUtils';

import { modifyEventTrigger, deleteEventTrigger } from '../../ServerIO';

import { NotFoundError } from '../../../../Error/PageNotFound';
import { HasuraMetadataV3 } from '../../../../../metadata/types';
import { getEventTriggers } from '../../../../../metadata/selector';

interface Props extends InjectedProps {}

const Modify: React.FC<Props> = props => {
  const {
    currentTrigger,
    allSchemas,
    readOnlyMode,
    dispatch,
    metadataObject,
  } = props;
  console.log({ currentTrigger, allSchemas });
  const { state, setState } = useEventTriggerModify(
    currentTrigger,
    allSchemas,
    metadataObject
  );

  React.useEffect(() => {
    if (currentTrigger) {
      dispatch(
        updateSchemaInfo({
          schemas: [currentTrigger.schema_name],
        })
      );
    }
  }, [currentTrigger.name]);

  const table = findETTable(currentTrigger, allSchemas);

  const saveWrapper = (property: EventTriggerProperty) => (
    successCb?: () => void,
    errorCb?: () => void
  ) => {
    dispatch(
      modifyEventTrigger(
        property,
        state,
        currentTrigger,
        table,
        successCb,
        errorCb
      )
    );
  };

  const deleteWrapper = () => {
    dispatch(deleteEventTrigger(currentTrigger));
  };

  return (
    <div>
      <TableHeader
        count={null}
        triggerName={currentTrigger.name}
        tabName="modify"
        readOnlyMode={readOnlyMode}
      />
      <br />
      <div className={styles.container}>
        <Info currentTrigger={currentTrigger} styles={styles} />
        <WebhookEditor
          currentTrigger={currentTrigger}
          webhook={state.webhook}
          setWebhook={setState.webhook}
          save={saveWrapper('webhook')}
          styles={styles}
        />
        <OperationEditor
          currentTrigger={currentTrigger}
          allTableColumns={
            findETTable(currentTrigger, allSchemas)?.columns || []
          }
          operations={state.operations}
          setOperations={setState.operations}
          operationColumns={state.operationColumns}
          setOperationColumns={setState.operationColumns}
          styles={styles}
          save={saveWrapper('ops')}
        />
        <RetryConfEditor
          conf={state.retryConf}
          setRetryConf={setState.retryConf}
          currentTrigger={currentTrigger}
          styles={styles}
          save={saveWrapper('retry_conf')}
        />
        <HeadersEditor
          headers={state.headers}
          setHeaders={setState.headers}
          styles={styles}
          currentTrigger={currentTrigger}
          save={saveWrapper('headers')}
        />
        {!readOnlyMode && (
          <div className={styles.add_mar_bottom}>
            <Button
              color="red"
              size="sm"
              data-test="delete-trigger"
              onClick={deleteWrapper}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
      <br />
      <br />
    </div>
  );
};

const mapStateToProps = (state: ReduxState, ownProps: RouterTriggerProps) => {
  const triggerList = getEventTriggers(state);
  const modifyTriggerName = ownProps.params.triggerName;
  const metadataObject = state.metadata.metadataObject;
  const currentDataSource = state.tables.currentDataSource;
  let currentTrigger: any = triggerList.find(
    tr => tr.name === modifyTriggerName
  );

  if (!currentTrigger) {
    // TODO: search within the metadata object
    const currentSourceTriggers = (metadataObject as HasuraMetadataV3).sources
      .find(meta => meta.name === currentDataSource)
      ?.tables.map(tab => tab.event_triggers);

    currentSourceTriggers?.find(evtTr => {
      // FIXME: I don't know what I should be doing here
      currentTrigger = evtTr?.find(evt => evt.name === modifyTriggerName);
    });
  }

  if (!currentTrigger) {
    // throw a 404 exception
    throw new NotFoundError();
  }

  return {
    currentTrigger,
    allSchemas: state.tables.allSchemas,
    readOnlyMode: state.main.readOnlyMode,
    metadataObject: state.metadata.metadataObject,
  };
};

const connector = connect(mapStateToProps, mapDispatchToPropsEmpty);
type InjectedProps = ConnectedProps<typeof connector>;

const ModifyConnector = connector(Modify);
export default ModifyConnector;
