import { type Event, type Store, sample, createStore, is } from 'effector';

import { setupListener, type Setupable } from './shared';

// TODO: define Key type
type Key = any;

// TODO: ctrl, cmd, alt, shift
type Mod = any;

type Keyboard = {
  sequence(
    needle: string | Store<string> | Store<string | null>,
    opts?: { mods?: Mod[] }
  ): Event<void>;
  hotkey(keys: Key[], opts?: { type?: 'keypress' | 'keyup' }): Event<void>;
  mod(mod: Mod): Store<boolean>;
};

export function trackKeyboard(config: Setupable): Keyboard {
  return {
    sequence(
      needle: string | Store<string> | Store<string | null>,
      opts?: { mods?: Mod[] }
    ) {
      const $pressedKeys = createStore<string[]>([], { serialize: 'ignore' });

      const keypress = setupListener<KeyboardEvent>(
        {
          add: (listener) => document.addEventListener('keypress', listener),
          remove: (listener) =>
            document.removeEventListener('keypress', listener),
        },
        config
      );

      sample({
        clock: keypress,
        source: $pressedKeys,
        fn: (oldKeys, event) => [...oldKeys, event.key],
        target: $pressedKeys,
      });

      const $wantedSequence: Store<string> = is.store(needle)
        ? needle
        : createStore(needle as string, { serialize: 'ignore' });

      const typed = sample({
        source: { pressedKeys: $pressedKeys, wantedSequence: $wantedSequence },
        filter: ({ pressedKeys, wantedSequence }) =>
          pressedKeys.join('').includes(wantedSequence),
        fn: () => {
          // nothing
        },
      });

      sample({ clock: typed, fn: () => [], target: $pressedKeys });

      return typed;
    },
  } as any;
}
