import {
  type Event,
  type Store,
  combine,
  createEvent,
  createStore,
  sample,
} from 'effector';

import { type Setupable, readValue, setupListener } from './shared';
import { type TriggerProtocol } from './trigger_protocol';

type PrefereredLanguages = ({ setup, teardown }: Setupable) => {
  languageChanged: Event<void>;
  $language: Store<string | null>;
  $languages: Store<readonly string[]>;
};

type ScopeOverridesSupport = {
  $acceptLanguageHeader: Store<string | null>;
};

const $acceptLanguageHeader = createStore<string | null>(null, {
  serialize: 'ignore',
});

const $headerLanguages = $acceptLanguageHeader.map((header) => {
  if (!header) {
    return [];
  }

  return header
    .split(',')
    .map((lang) => lang.split(';')[0]?.trim())
    .filter((lang) => lang && lang !== '*');
});

const trackPreferredLanguages: PrefereredLanguages &
  TriggerProtocol &
  ScopeOverridesSupport = (config) => {
  const $navigatorLanguages = createStore(
    readValue(() => navigator.languages, []),
    { serialize: 'ignore' }
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

  sample({ clock: languagesChanged, target: $navigatorLanguages });

  const $languages = combine(
    { fromHeader: $headerLanguages, fromNavigator: $navigatorLanguages },
    ({ fromHeader, fromNavigator }) =>
      fromHeader.length > 0 ? fromHeader : fromNavigator
  );

  const $language = $languages.map(
    (languages): string | null => languages[0] ?? null
  );

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

trackPreferredLanguages.$acceptLanguageHeader = $acceptLanguageHeader;

export { trackPreferredLanguages };
