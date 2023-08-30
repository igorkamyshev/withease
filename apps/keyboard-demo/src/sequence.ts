import { trackKeyboard } from '@withease/keyboard';
import { createEffect, createEvent, createStore, sample } from 'effector';

// -- infra

const appStarted = createEvent();

const keyboard = trackKeyboard({ setup: appStarted });

// -- input

const $targetSequence = createStore<string>('iddqd');
const targetSequenceChanged = createEvent<string>();

const targetSequenceInput =
  document.querySelector<HTMLInputElement>('#target-sequence')!;

targetSequenceInput.value = $targetSequence.getState();
targetSequenceInput.addEventListener('input', () =>
  targetSequenceChanged(targetSequenceInput.value)
);

// -- output
const addNewOutputFx = createEffect({
  handler: ({
    targetSequence,
    container,
  }: {
    targetSequence: string;
    container: HTMLUListElement;
  }) => {
    const el = document.createElement('li');
    el.textContent = targetSequence;
    container.appendChild(el);
  },
});

const dynamicSequenceTriggered = keyboard.sequence($targetSequence);

const dynamicOutputList = document.querySelector<HTMLUListElement>(
  '#dynamic-output-list'
)!;

sample({
  clock: dynamicSequenceTriggered,
  source: $targetSequence,
  fn: (targetSequence) => ({ targetSequence, container: dynamicOutputList }),
  target: addNewOutputFx,
});

const staticOutputList = document.querySelector<HTMLUListElement>(
  '#static-output-list'
)!;

sample({
  clock: keyboard.sequence('my-fav-st'),
  fn: () => ({ targetSequence: 'my-fav-st', container: staticOutputList }),
  target: addNewOutputFx,
});

// -- start

appStarted();
