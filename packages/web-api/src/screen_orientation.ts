import { type Store, createEvent, createStore, sample } from 'effector';

import { type Setupable, readValue, setupListener } from './shared';
import { type TriggerProtocol } from './trigger_protocol';

type ScreenOrientation = ({ setup, teardown }: Setupable) => {
  $type: Store<null | OrientationType>;
  $angle: Store<null | number>;
};

const trackScreenOrientation: ScreenOrientation & TriggerProtocol = (
  config
) => {
  const $type = createStore<null | OrientationType>(
    readValue(() => screen.orientation.type, null),
    {
      serialize: 'ignore',
    }
  );
  const $angle = createStore<number | null>(
    readValue(() => screen.orientation.angle, null),
    { serialize: 'ignore' }
  );

  const orientationChanged = setupListener(
    {
      add: (listener) =>
        screen.orientation.addEventListener('change', listener),
      remove: (listener) =>
        screen.orientation.removeEventListener('change', listener),
      readPayload: () => screen.orientation,
    },
    config
  );

  sample({
    clock: orientationChanged,
    fn: () => screen.orientation.type,
    target: $type,
  });

  sample({
    clock: orientationChanged,
    fn: () => screen.orientation.angle,
    target: $angle,
  });

  return { $type, $angle };
};

trackScreenOrientation['@@trigger'] = () => {
  const setup = createEvent();
  const teardown = createEvent();

  const { $type } = trackScreenOrientation({ setup, teardown });

  const fired = sample({
    clock: $type.updates,
    fn: (): void => {
      // noop
    },
  });

  return { setup, teardown, fired };
};

export { trackScreenOrientation };
