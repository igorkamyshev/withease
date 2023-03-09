import { createEvent, createStore, Event, Store } from 'effector';

import { TriggerProtocol } from './trigger_protocol';

type NetworkStatus = ({
  setup,
  teardown,
}: {
  setup: Event<void>;
  teardown?: Event<void>;
}) => {
  connected: Event<void>;
  disconnected: Event<void>;
  $online: Store<boolean>;
  $offline: Store<boolean>;
};

const trackNetworkStatus: NetworkStatus & TriggerProtocol = ({
  setup,
  teardown,
}) => {
  const connected = createEvent();
  const disconnected = createEvent();

  const $online = createStore(false, { serialize: 'ignore' });
  const $offline = createStore(false, { serialize: 'ignore' });

  return { connected, disconnected, $offline, $online };
};

trackNetworkStatus['@@trigger'] = () => {
  const setup = createEvent();

  const { connected } = trackNetworkStatus({ setup });

  return { setup, fired: connected };
};

export { trackNetworkStatus };
