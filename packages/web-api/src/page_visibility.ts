import {
  type Event,
  type Store,
  createEvent,
  createStore,
  sample,
} from 'effector';

import { readValue, setupListener, type Setupable } from './shared';
import { type TriggerProtocol } from './trigger_protocol';

type PageVisibility = ({ setup, teardown }: Setupable) => {
  visible: Event<void>;
  hidden: Event<void>;
  $visible: Store<boolean>;
  /** @deprecated */
  $visibile: Store<boolean>;
  $hidden: Store<boolean>;
};

const trackPageVisibility: PageVisibility & TriggerProtocol = (config) => {
  const visibilityChanged = setupListener<DocumentVisibilityState>(
    {
      add: (listener) =>
        document.addEventListener('visibilitychange', listener),
      remove: (listener) =>
        document.removeEventListener('visibilitychange', listener),
      readPayload: () => document.visibilityState,
    },
    config
  );

  const $visibilityState = createStore(
    readValue(() => document.visibilityState, 'visible'),
    { serialize: 'ignore' }
  ).on(visibilityChanged, (_, state) => state);

  // -- Public API
  const $visible = $visibilityState.map((state) => state === 'visible');
  const $hidden = $visibilityState.map((state) => state === 'hidden');

  const visible = sample({
    clock: $visible.updates,
    fn: (): void => {
      //
    },
  });
  const hidden = sample({
    clock: $hidden.updates,
    fn: (): void => {
      //
    },
  });

  // -- Result
  return { visible, hidden, $visible, $visibile: $visible, $hidden };
};

trackPageVisibility['@@trigger'] = () => {
  const setup = createEvent();
  const teardown = createEvent();

  const { visible } = trackPageVisibility({ setup, teardown });

  return { setup, teardown, fired: visible };
};

export { trackPageVisibility };
