import { Event, Store, createEvent, createStore, sample } from 'effector';

import { Setupable, readValue, setupListener } from './shared';
import { TriggerProtocol } from './trigger_protocol';

type PrefereredLanguages = ({ setup, teardown }: Setupable) => {
  languageChanged: Event<void>;
  $language: Store<string | null>;
  $languages: Store<readonly string[]>;
};

// TODO: SSR support, Accept-Language header
const trackPreferredLanguages: PrefereredLanguages & TriggerProtocol = (
  config
) => {
  const $languages = createStore(
    readValue(() => navigator.languages, []),
    { serialize: 'ignore' }
  );

  const $language = $languages.map(
    (languages): string | null => languages[0] ?? null
  );

  const languagesChanged = setupListener(
    {
      add: (listener) => window.addEventListener('languagechange', listener),
      remove: (listener) =>
        window.removeEventListener('languagechange', listener),
      readPayload: () => navigator.languages,
    },
    config
  );

  sample({ clock: languagesChanged, target: $languages });

  const languageChanged = sample({
    clock: languagesChanged,
    fn() {
      // noop
    },
  });

  return { $languages, $language, languageChanged };
};

trackPreferredLanguages['@@trigger'] = () => {
  const setup = createEvent();
  const teardown = createEvent();

  const { languageChanged } = trackPreferredLanguages({ setup, teardown });

  return { setup, teardown, fired: languageChanged };
};

export { trackPreferredLanguages };
