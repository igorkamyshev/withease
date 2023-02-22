import {
  attach,
  combine,
  createEffect,
  createEvent,
  createStore,
  Event,
  is,
  sample,
  scopeBind,
  Store,
} from 'effector';
import { type TFunction, i18n } from 'i18next';

interface Translated {
  (key: string, variables: Record<string, Store<string>>): Store<string>;
  (parts: TemplateStringsArray, ...stores: Array<Store<string>>): Store<string>;
}

type I18nextIntegration = {
  $t: Store<TFunction>;
  translated: Translated;
  $isReady: Store<boolean>;
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
    : createStore(instance as i18n | null);

  const destroy = teardown ?? createEvent();

  // -- Public API
  const $isReady = createStore(false, { serialize: 'ignore' });

  const $t = createStore<TFunction>(identity, { serialize: 'ignore' });

  sample({
    clock: [
      instanceInitialized,
      sample({ clock: contextChanged, source: $instance, filter: Boolean }),
    ],
    fn: (i18next) => i18next.t.bind(i18next),
    target: $t,
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

        return t(finalKey);
      }
    );
  }

  function translatedWithVariables(
    key: string,
    variables: Record<string, Store<string>>
  ): Store<string> {
    return combine(
      { t: $t, variables: combine(variables) },
      ({ t, variables }) => t(key, variables)
    );
  }

  // -- Setup

  const initInstanceFx = attach({
    source: $instance,
    async effect(i18next) {
      if (!i18next) {
        return null;
      }

      if (i18next.isInitialized) {
        return i18next;
      }

      await i18next.init();
      return i18next;
    },
  });

  const $contextChangeListener = createStore<(() => void) | null>(null, {
    serialize: 'ignore',
  });

  const setupListenersFx = createEffect((i18next: i18n) => {
    const boundContextChanged = scopeBind(contextChanged, { safe: true });
    const listener = () => boundContextChanged();

    i18next.on('languageChanged', listener);
    i18next.store.on('added', listener);

    return listener;
  });

  const destroyListenersFx = attach({
    source: { listener: $contextChangeListener, i18next: $instance },
    effect: ({ listener, i18next }) => {
      if (!listener || !i18next) {
        return;
      }

      i18next.off('languageChanged', listener);
      i18next.store.off('added', listener);
    },
  });

  sample({ clock: [setup, $instance.updates], target: initInstanceFx });
  sample({
    clock: initInstanceFx.doneData,
    filter: Boolean,
    target: [instanceInitialized, setupListenersFx],
  });

  sample({ clock: setupListenersFx.doneData, target: $contextChangeListener });
  sample({ clock: destroy, target: destroyListenersFx });
  sample({
    clock: destroyListenersFx.done,
    target: $contextChangeListener.reinit!,
  });

  return {
    $isReady,
    $t,
    translated: (firstArg, ...args: any[]) => {
      if (typeof firstArg === 'string') {
        return translatedWithVariables(firstArg, args.at(0));
      } else {
        return translatedLiteral(firstArg, ...args);
      }
    },
  };
}
