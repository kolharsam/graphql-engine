import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTable from 'react-table';

import styles from '../../Events.scss';
import InvocationLogDetails from './InvocationLogDetails';
import { Event } from '../../types';
import Endpoints from '../../../../../Endpoints';
import {
  getEventInvocationsLogByID,
  SupportedEvents,
} from '../../../../../metadata/queryUtils';
import requestAction from '../../../../../utils/requestAction';
import { sanitiseRow } from '../../utils';
import { Dispatch } from '../../../../../types';

interface Props extends InjectedReduxProps {
  rows: any[];
  rowsFormatted: any[];
  headings: {
    Header: string;
    accessor: string;
  }[];
  event: Event;
  makeAPICall?: boolean;
  triggerType?: SupportedEvents;
}

type RenderSubTableProps = Omit<
  Props,
  'makeAPICall' | 'triggerType' | 'invocationsData'
>;

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
  const [inv, setInvocations] = React.useState([]);
  const [errInfo, setErrInfo] = React.useState(null);

  React.useEffect(() => {
    if (!triggerType || !props.event.id) {
      return;
    }
    const url = Endpoints.metadata;
    const payload = getEventInvocationsLogByID(triggerType, props.event.id);
    const query = {
      method: 'POST',
      body: JSON.stringify(payload),
    };
    // FIXME: separate this from here
    props
      .invocationsData(url, query)
      .then(data => {
        if (data && data?.invocations) {
          setInvocations(data.invocations);
          return;
        }
        setInvocations([]);
      })
      .catch(err => setErrInfo(err));
  }, []);

  if (!makeAPICall || !triggerType) {
    return (
      <RenderEventSubTable
        event={props.event}
        rowsFormatted={props.rowsFormatted}
        headings={props.headings}
        rows={props.rows}
      />
    );
  }

  if (errInfo) {
    return <div>No data available.</div>;
  }

  const invocationRows = inv.map((r: any, i: number) => {
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
      rows={inv}
      rowsFormatted={invocationRows}
      headings={props.headings}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  invocationsData: (url: string, options: RequestInit) =>
    dispatch(requestAction(url, options))
      .then(data => ({
        invocations: data.invocations,
        error: null,
      }))
      .catch(err => ({
        invocations: [],
        error: err,
      })),
});
const connector = connect(null, mapDispatchToProps);
type InjectedReduxProps = ConnectedProps<typeof connector>;
const connectedEventSubTable = connector(EventsSubTable);

export default connectedEventSubTable;
