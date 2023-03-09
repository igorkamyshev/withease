import { createEvent, createStore, Event, Store } from 'effector';

import { TriggerProtocol } from './trigger_protocol';

type WindowFocus = ({
  setup,
  teardown,
}: {
  setup: Event<void>;
  teardown?: Event<void>;
}) => {
  focused: Event<void>;
  blured: Event<void>;
  $hasFocus: Store<boolean>;
};

const trackWindowFocus: WindowFocus & TriggerProtocol = ({
  setup,
  teardown,
}) => {
  const focused = createEvent();
  const blured = createEvent();
  const $hasFocus = createStore(false, { serialize: 'ignore' });

  return { focused, blured, $hasFocus };
};

trackWindowFocus['@@trigger'] = () => {
  const setup = createEvent();

  const { focused } = trackWindowFocus({ setup });

  return { setup, fired: focused };
};

export { trackWindowFocus };
