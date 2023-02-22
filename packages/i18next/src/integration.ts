import {
  attach,
  createEvent,
  createStore,
  Event,
  is,
  sample,
  scopeBind,
  Store,
} from "effector";
import { type TFunction, i18n } from "i18next";

type I18nextIntegration = {
  $t: Store<TFunction>;
  translated: () => Store<string>;
};

export function createI18nextIntegration({
  instance,
  setup,
  teardown,
}: {
  instance: i18n | Store<i18n | null>;
  setup: Event<void>;
  teardown?: Event<void>;
}): I18nextIntegration {
  const instanceInitialized = createEvent<i18n>();

  const $instance: Store<i18n | null> = is.store(instance)
    ? instance
    : createStore(instance as i18n | null);

  const identity = ((key: string) => key) as TFunction;
  const $t = createStore<TFunction>(identity);

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

  sample({
    clock: instanceInitialized,
    fn: (i18next) => i18next.t.bind(i18next),
    target: $t,
  });

  return {
    $t,
    translated: () => null as any,
  };
}
