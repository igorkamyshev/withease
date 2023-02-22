import {
  attach,
  combine,
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

  // -- Parse options
  const $instance: Store<i18n | null> = is.store(instance)
    ? instance
    : createStore(instance as i18n | null);

  // -- Public API
  const $t = createStore<TFunction>(identity).on(
    instanceInitialized,
    (_, i18next) => i18next.t.bind(i18next)
  );

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

  const initInstance = attach({
    source: $instance,
    effect: async (i18next) => {
      const onInitialized = scopeBind(instanceInitialized, { safe: true });
      if (!i18next) {
        return;
      }

      if (i18next.isInitialized) {
        onInitialized(i18next);
        return;
      }

      await i18next.init();
      onInitialized(i18next);
    },
  });

  sample({ clock: [setup, $instance.updates], target: initInstance });

  return {
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
