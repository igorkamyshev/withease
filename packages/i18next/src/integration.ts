import {
  type Event,
  type Store,
  type Effect,
  attach,
  combine,
  createEffect,
  createEvent,
  createStore,
  is,
  sample,
  scopeBind,
} from 'effector';
import { type TFunction, i18n } from 'i18next';

interface Translated {
  (key: string, variables?: Record<string, Store<string>>): Store<string>;
  (parts: TemplateStringsArray, ...stores: Array<Store<string>>): Store<string>;
}

type MissinKeyReport = {
  lngs: readonly string[];
  namespace: string;
  key: string;
  res: string;
};

type I18nextIntegration = {
  $t: Store<TFunction>;
  translated: Translated;
  $isReady: Store<boolean>;
  $language: Store<string | null>;
  changeLanguageFx: Effect<string, void, unknown>;
  reporting: {
    missingKey: Event<MissinKeyReport>;
  };
};

const identity = ((key: string) => key) as TFunction;

export function createI18nextIntegration({
  instance,
  setup,
  teardown,
}: {
  instance: i18n | Store<i18n | null>;
  setup: Event<void>;
  teardown?: Event<void>;
}): I18nextIntegration {
  // -- Internval events
  const instanceInitialized = createEvent<i18n>();
  const contextChanged = createEvent();

  // -- Parse options
  const $instance: Store<i18n | null> = is.store(instance)
    ? instance
    : createStore(instance as i18n | null, {
        serialize: 'ignore',
        name: '$instance',
      });

  const destroy = teardown ?? createEvent();

  // -- Internal API

  const $derivedT = combine($instance, (i18next): TFunction | null =>
    i18next ? i18next.t.bind(i18next) : null
  );
  const $stanaloneT = createStore<TFunction | null>(null, {
    serialize: 'ignore',
    name: '$stanaloneT',
  });

  // -- Public API
  const $isReady = createStore(false, { serialize: 'ignore' });

  const $t = combine(
    { derived: $derivedT, standalone: $stanaloneT },
    ({ derived, standalone }): TFunction => standalone ?? derived ?? identity
  );

  const reporting = {
    missingKey: createEvent<MissinKeyReport>(),
  };

  const $language = createStore<string | null>(null, { serialize: 'ignore' });

  const changeLanguageFx = attach({
    source: $instance,
    async effect(instance, nextLangauge: string) {
      if (!instance) {
        return;
      }

      await instance.changeLanguage(nextLangauge);
    },
  });

  // -- End of public API

  sample({
    clock: [
      instanceInitialized,
      sample({ clock: contextChanged, source: $instance, filter: Boolean }),
    ],
    fn: (i18next) => i18next.t.bind(i18next),
    target: $stanaloneT,
  });

  sample({
    clock: [
      instanceInitialized,
      sample({ clock: contextChanged, source: $instance, filter: Boolean }),
    ],
    fn: (i18next) => i18next.language,
    target: $language,
  });

  sample({
    clock: instanceInitialized,
    fn: () => true,
    target: $isReady,
  });

  sample({ clock: destroy, fn: () => false, target: $isReady });

  function translatedLiteral(
    parts: TemplateStringsArray,
    ...stores: Array<Store<string>>
  ): Store<string> {
    return combine(
      { t: $t, dynamicParts: combine(stores) },
      ({ t, dynamicParts }) => {
        const result = [] as string[];

        parts.forEach((part, i) => {
          const resolved = dynamicParts[i];

          result.push(part, resolved ?? '');
        });

        const finalKey = result.join('');

        return t(finalKey) ?? finalKey;
      }
    );
  }

  function translatedWithVariables(
    key: string,
    variables?: Record<string, Store<string>>
  ): Store<string> {
    return combine(
      { t: $t, variables: combine(variables ?? {}) },
      ({ t, variables }) => t(key, variables) ?? key
    );
  }

  // -- Setup

  const initInstanceFx = attach({
    source: $instance,
    async effect(i18next) {
      if (!i18next) {
        return null;
      }

      // Subscribe to missing key event BEFORE init
      const boundMissingKey = scopeBind(reporting.missingKey, { safe: true });
      const missingKeyListener = (
        lngs: readonly string[],
        namespace: string,
        key: string,
        res: string
      ) => boundMissingKey({ lngs, namespace, key, res });
      i18next.on('missingKey', missingKeyListener);

      if (i18next.isInitialized) {
        return { i18next, missingKeyListener };
      }

      await i18next.init();
      return { i18next, missingKeyListener };
    },
  });

  const $contextChangeListener = createStore<(() => void) | null>(null, {
    serialize: 'ignore',
    name: '$contextChangeListener',
  });

  const $missingKeyListener = createStore<(() => void) | null>(null, {
    serialize: 'ignore',
    name: '$missingKeyListener',
  });

  const setupListenersFx = createEffect((i18next: i18n) => {
    // Context change
    const boundContextChanged = scopeBind(contextChanged, { safe: true });
    const contextChangeListener = () => boundContextChanged();

    i18next.on('languageChanged', contextChangeListener);
    i18next.store.on('added', contextChangeListener);

    // Result
    return { contextChangeListener };
  });

  const destroyListenersFx = attach({
    source: {
      contextChangeListener: $contextChangeListener,
      missingKeyListener: $missingKeyListener,
      i18next: $instance,
    },
    effect: ({ contextChangeListener, missingKeyListener, i18next }) => {
      if (!i18next) {
        return;
      }

      if (contextChangeListener) {
        i18next.off('languageChanged', contextChangeListener);
        i18next.store.off('added', contextChangeListener);
      }

      if (missingKeyListener) {
        i18next.off('missingKey', missingKeyListener);
      }
    },
  });

  sample({ clock: [setup, $instance.updates], target: initInstanceFx });
  sample({
    clock: initInstanceFx.doneData,
    filter: Boolean,
    fn: ({ i18next }) => i18next,
    target: [instanceInitialized, setupListenersFx],
  });

  sample({
    clock: setupListenersFx.doneData,
    fn: ({ contextChangeListener }) => contextChangeListener,
    target: $contextChangeListener,
  });
  sample({
    clock: initInstanceFx.doneData,
    filter: Boolean,
    fn: ({ missingKeyListener }) => missingKeyListener,
    target: $missingKeyListener,
  });
  sample({ clock: destroy, target: destroyListenersFx });
  sample({
    clock: destroyListenersFx.done,
    target: [$contextChangeListener.reinit, $missingKeyListener.reinit],
  });

  return {
    $isReady,
    $t,
    $language,
    changeLanguageFx,
    translated: (firstArg, ...args: any[]) => {
      if (typeof firstArg === 'string') {
        return translatedWithVariables(firstArg, args[0]);
      } else {
        return translatedLiteral(firstArg, ...args);
      }
    },
    reporting,
  };
}
