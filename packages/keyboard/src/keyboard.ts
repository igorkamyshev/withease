import { createEvent, sample, type Event, type Store } from 'effector';
import { type Setupable } from './shared';

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
      const triggered = createEvent();
      return triggered;
    },
  } as any;
}
