import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTable from 'react-table';

import styles from '../../Events.scss';
import InvocationLogDetails from './InvocationLogDetails';
import { Event } from '../../types';
import { mapDispatchToPropsEmpty } from '../../../../Common/utils/reactUtils';
import Endpoints from '../../../../../Endpoints';
import {
  getEventInvocationsLogByID,
  SupportedEvents,
} from '../../../../../metadata/queryUtils';
import requestAction from '../../../../../utils/requestAction';
import { sanitiseRow } from '../../utils';

interface Props extends InjectedReduxProps {
  rows: any[];
  rowsFormatted:
    | {
        request: any;
        response: any;
      }[]
    | [];
  headings: {
    Header: string;
    accessor: string;
  }[];
  event: Event;
  makeAPICall?: boolean;
  triggerType?: SupportedEvents;
}

type RenderSubTableProps = Omit<Props, 'makeAPICall'>;

const invocationColumns = ['status', 'id', 'created_at'];

const RenderEventSubTable: React.FC<RenderSubTableProps> = ({
  event,
  rows,
  rowsFormatted,
  headings,
}) => (
  <div className={styles.addPadding20Px}>
    {event.webhook_conf && (
      <div className={`row ${styles.add_mar_bottom_mid}`}>
        <div className="col-md-2">
          <b>Webhook:</b>
        </div>
        <div className="col-md-4">{event.webhook_conf}</div>
      </div>
    )}
    {event.comment && (
      <div className={`row ${styles.add_mar_bottom_mid}`}>
        <div className="col-md-2">
          <b>Comment:</b>
        </div>
        <div className="col-md-4">{event.comment}</div>
      </div>
    )}
    <div className={styles.add_mar_bottom_mid}>
      <b>Recent Invocations:</b>
    </div>
    <div className={`${styles.invocationsSection}`}>
      {rows.length ? (
        <ReactTable
          data={rowsFormatted}
          columns={headings}
          defaultPageSize={rows.length}
          minRows={0}
          showPagination={false}
          SubComponent={(logRow: any) => {
            const invocationLog = rows[logRow.index];
            const currentPayload = JSON.stringify(
              invocationLog.request,
              null,
              4
            );
            const finalResponse = JSON.stringify(
              invocationLog.response,
              null,
              4
            );
            return (
              <InvocationLogDetails
                requestPayload={currentPayload}
                responsePayload={finalResponse}
              />
            );
          }}
        />
      ) : (
        <div>No data available</div>
      )}
    </div>
    <br />
    <br />
  </div>
);

const EventsSubTable: React.FC<Props> = ({
  makeAPICall,
  triggerType,
  ...props
}) => {
  if (makeAPICall && triggerType) {
    // make the api call and all the formatting here.
    const url = Endpoints.metadata;
    const payload = getEventInvocationsLogByID(triggerType, props.event.id);
    const query = {
      method: 'POST',
      body: JSON.stringify(payload),
    };
    props
      .dispatch(requestAction(url, query))
      .then(data => {
        if (data && data?.length) {
          const logs = data.invocations;
          const invocationRows = logs.map((r: any, i: number) => {
            const newRow: Record<string, JSX.Element> = {};
            // Insert cells corresponding to all rows
            invocationColumns.forEach(col => {
              newRow[col] = (
                <div
                  className={styles.tableCellCenterAlignedOverflow}
                  key={`${col}-${col}-${i}`}
                >
                  {sanitiseRow(col, r)}
                </div>
              );
            });
            return newRow;
          });
          return (
            <RenderEventSubTable
              event={props.event}
              rows={logs}
              rowsFormatted={invocationRows}
              headings={props.headings}
              {...props}
            />
          );
        }

        return <div>No data available.</div>;
      })
      .catch(() => <div>No data available.</div>);
  }

  return <RenderEventSubTable {...props} />;
};

const connector = connect(null, mapDispatchToPropsEmpty);
type InjectedReduxProps = ConnectedProps<typeof connector>;
const connectedEventSubTable = connector(EventsSubTable);

export default connectedEventSubTable;
