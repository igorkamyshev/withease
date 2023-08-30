import { createEffect, createEvent, createStore, sample } from 'effector';
import { trackKeyboard } from '@withease/keyboard';

// -- infra

const appStarted = createEvent();

const keyboard = trackKeyboard({ setup: appStarted });

const addListItemFx = createEffect(
  ({
    container,
    content,
  }: {
    container: HTMLUListElement | null;
    content: string;
  }) => {
    if (!container) {
      return;
    }

    const el = document.createElement('li');
    el.textContent = content;
    container.appendChild(el);
  }
);

// -- static value

const STATIC_TARGET_SEQUENCE = 'my-fav-st';

const staticOutputList = document.querySelector<HTMLUListElement>(
  '#static-output-list'
);

sample({
  clock: keyboard.sequence(STATIC_TARGET_SEQUENCE),
  fn: () => ({ content: STATIC_TARGET_SEQUENCE, container: staticOutputList }),
  target: addListItemFx,
});

// -- dynamic value

const $targetSequence = createStore<string>('iddqd');
const targetSequenceChanged = createEvent<string>();

const targetSequenceInput =
  document.querySelector<HTMLInputElement>('#target-sequence');

if (targetSequenceInput) {
  targetSequenceInput.value = $targetSequence.getState(); // Sync initial value
  targetSequenceInput.addEventListener('input', () =>
    targetSequenceChanged(targetSequenceInput.value)
  );
}

const dynamicOutputList = document.querySelector<HTMLUListElement>(
  '#dynamic-output-list'
);

sample({
  clock: keyboard.sequence($targetSequence),
  source: $targetSequence,
  fn: (targetSequence) => ({
    content: targetSequence,
    container: dynamicOutputList,
  }),
  target: addListItemFx,
});

// -- start

appStarted();
