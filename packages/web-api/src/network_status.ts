import { type Event, type Store, createEvent, createStore } from 'effector';

import { readValue, setupListener, type Setupable } from './shared';
import { type TriggerProtocol } from './trigger_protocol';

type NetworkStatus = ({ setup, teardown }: Setupable) => {
  online: Event<void>;
  offline: Event<void>;
  $online: Store<boolean>;
  $offline: Store<boolean>;
};

const trackNetworkStatus: NetworkStatus & TriggerProtocol = (config) => {
  const online = setupListener<void>(
    {
      add: (listener) => window.addEventListener('online', listener),
      remove: (listener) => window.removeEventListener('online', listener),
    },
    config
  );
  const offline = setupListener<void>(
    {
      add: (listener) => window.addEventListener('offline', listener),
      remove: (listener) => window.removeEventListener('offline', listener),
    },
    config
  );

  const $online = createStore(
    readValue(() => navigator.onLine, true),
    { serialize: 'ignore' }
  )
    .on(online, () => true)
    .on(offline, () => false);

  const $offline = $online.map((online) => !online);

  return { online, offline, $offline, $online };
};

trackNetworkStatus['@@trigger'] = () => {
  const setup = createEvent();
  const teardown = createEvent();

  const { online } = trackNetworkStatus({ setup, teardown });

  return { setup, teardown, fired: online };
};

export { trackNetworkStatus };
