import React from 'react';
import CheckIcon from '../../../../Common/Icons/Check';
import CrossIcon from '../../../../Common/Icons/Cross';
import ClockIcon from '../../../../Common/Icons/Clock';
import Skull from '../../../../Common/Icons/Invalid';
import {
  SupportedEvents,
  getEventInvocationsLogByID,
} from '../../../../../metadata/queryUtils';
import Endpoints from '../../../../../Endpoints';
import requestAction from '../../../../../utils/requestAction';

export const getEventStatusIcon = (status: string) => {
  switch (status) {
    case 'scheduled':
      return <ClockIcon title="This event has been scheduled" />;
    case 'dead':
      return <Skull title="This event is dead and will never be delivered" />;
    case 'delivered':
      return <CheckIcon title="This event has been delivered" />;
    case 'error':
      return <CrossIcon title="This event failed with an error" />;
    default:
      return null;
  }
};

export const getEventDeliveryIcon = (delivered: boolean) => {
  return delivered ? (
    <CheckIcon title="This event has been delivered" />
  ) : (
    <CrossIcon title="This event has not been delivered" />
  );
};

export const getInvocationLogStatus = (status: number) => {
  return status < 300 ? <CheckIcon /> : <CrossIcon />;
};

export const getEventInvocationThunk = (
  triggerType: SupportedEvents,
  event_id: string
) => {
  const url = Endpoints.metadata;
  const payload = getEventInvocationsLogByID(triggerType, event_id);
  const query = {
    method: 'POST',
    body: JSON.stringify(payload),
  };

  return requestAction(url, query);
};
