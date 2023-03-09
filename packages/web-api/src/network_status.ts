import { createEvent, createStore, Event, Store } from 'effector';

import { TriggerProtocol } from './trigger_protocol';

type NetworkStatus = ({
  setup,
  teardown,
}: {
  setup: Event<void>;
  teardown?: Event<void>;
}) => {
  online: Event<void>;
  $online: Store<boolean>;
  offline: Event<void>;
  $offline: Store<boolean>;
};

const trackNetworkStatus: NetworkStatus & TriggerProtocol = ({
  setup,
  teardown,
}) => {
  const online = createEvent();
  const offline = createEvent();
  const $online = createStore(false, { serialize: 'ignore' });
  const $offline = createStore(false, { serialize: 'ignore' });

  return { online, offline, $offline, $online };
};

trackNetworkStatus['@@trigger'] = () => {
  const setup = createEvent();

  const { online } = trackNetworkStatus({ setup });

  return { setup, fired: online };
};

export { trackNetworkStatus };
