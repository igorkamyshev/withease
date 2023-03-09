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
import { type TriggerProtocol } from './trigger_protocol';

type PageVisibility = ({
  setup,
  teardown,
}: {
  setup: Event<void>;
  teardown?: Event<void>;
}) => {
  visible: Event<void>;
  hidden: Event<void>;
  $visibile: Store<boolean>;
  $hidden: Store<boolean>;
};

const trackPageVisibility: PageVisibility & TriggerProtocol = ({
  setup,
  teardown,
}) => {
  // -- Main logic
  const visibilityChanged = createEvent<DocumentVisibilityState>();
  const $visibilityState = createStore(
    readValue(() => document.visibilityState, 'visible'),
    { serialize: 'ignore' }
  ).on(visibilityChanged, (_, state) => state);

  // -- Public API
  const $visibile = $visibilityState.map((state) => state === 'visible');
  const $hidden = $visibilityState.map((state) => state === 'hidden');
  const visible = visibilityChanged
    .filter({
      fn: (state) => state === 'visible',
    })
    .map((): void => void 1);
  const hidden = visibilityChanged
    .filter({
      fn: (state) => state === 'hidden',
    })
    .map((): void => void 1);

  // -- Listen
  const $visibilityListener = createStore<EventListener | null>(null, {
    serialize: 'ignore',
  });

  const listenVisibilityStateFx = createEffect(() => {
    const boundVisibilityChanged = scopeBind(visibilityChanged, { safe: true });

    const listener: EventListener = () =>
      boundVisibilityChanged(document.visibilityState);

    document.addEventListener('visibilitychange', listener);

    return listener;
  });

  sample({ clock: setup, listenVisibilityStateFx });
  sample({
    clock: listenVisibilityStateFx.doneData,
    target: $visibilityListener,
  });

  // -- Unlisten
  if (teardown) {
    const unlistenVisibilityStateFx = attach({
      source: $visibilityListener,
      effect(listener) {
        if (listener) {
          document.removeEventListener('visibilitychange', listener);
        }
      },
    });

    sample({ clock: teardown, unlistenVisibilityStateFx });
    sample({
      clock: unlistenVisibilityStateFx.done,
      target: $visibilityListener.reinit!,
    });
  }

  // -- Result
  return { visible, hidden, $visibile, $hidden };
};

trackPageVisibility['@@trigger'] = () => {
  const setup = createEvent();

  const { visible } = trackPageVisibility({ setup });

  return { setup, fired: visible };
};

export { trackPageVisibility };
