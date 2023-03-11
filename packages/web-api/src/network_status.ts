import {
  type Event,
  type Store,
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  scopeBind,
} from 'effector';
import { readValue } from './shared';

import { TriggerProtocol } from './trigger_protocol';

type NetworkStatus = ({
  setup,
  teardown,
}: {
  setup: Event<void>;
  teardown?: Event<void>;
}) => {
  online: Event<void>;
  offline: Event<void>;
  $online: Store<boolean>;
  $offline: Store<boolean>;
};

const trackNetworkStatus: NetworkStatus & TriggerProtocol = ({
  setup,
  teardown,
}) => {
  const online = createEvent();
  const offline = createEvent();

  const $online = createStore(
    readValue(() => navigator.onLine, true),
    { serialize: 'ignore' }
  )
    .on(online, () => true)
    .on(offline, () => false);
  const $offline = $online.map((online) => !online);

  // -- Listen
  const $listeners = createStore<{
    online: EventListener;
    offline: EventListener;
  } | null>(null, {
    serialize: 'ignore',
  });

  const listenFx = createEffect(() => {
    const boundOnline = scopeBind(online, { safe: true });
    const onlineListener: EventListener = () => boundOnline();

    const boundOffline = scopeBind(offline, { safe: true });
    const offlineListener: EventListener = () => boundOffline();

    window.addEventListener('online', onlineListener);
    window.addEventListener('offline', offlineListener);

    return { online: onlineListener, offline: offlineListener };
  });

  sample({ clock: setup, target: listenFx });
  sample({
    clock: listenFx.doneData,
    target: $listeners,
  });

  // -- Unlisten
  if (teardown) {
    const unlistenFx = attach({
      source: $listeners,
      effect(listeners) {
        if (listeners) {
          window.removeEventListener('online', listeners.online);
          window.removeEventListener('offline', listeners.offline);
        }
      },
    });

    sample({ clock: teardown, unlistenFx });
    sample({
      clock: unlistenFx.done,
      target: $listeners.reinit!,
    });
  }

  return { online, offline, $offline, $online };
};

trackNetworkStatus['@@trigger'] = () => {
  const setup = createEvent();
  const teardown = createEvent();

  const { online } = trackNetworkStatus({ setup, teardown });

  return { setup, teardown, fired: online };
};

export { trackNetworkStatus };
