// @vitest-environment jsdom

import { describe, test, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { allSettled, createEvent, createWatch, fork } from 'effector';

import { trackKeyboard } from './keyboard';

const setup = createEvent();
const teardown = createEvent();

const keyboard = trackKeyboard({ setup, teardown });

/*
 * Tests cannot be .concurrent because jsdom
 */
describe('trackKeyboard', () => {
  describe('sequence', () => {
    test('trigger after typing', async () => {
      const listener = vi.fn();

      const typed = keyboard.sequence('iddqd');

      const user = userEvent.setup();

      const scope = fork();

      createWatch({ unit: typed, fn: listener, scope });

      await allSettled(setup, { scope });

      await user.keyboard('iddqd');
      expect(listener).toBeCalledTimes(1);

      await user.keyboard('iddqd');
      expect(listener).toBeCalledTimes(2);

      await allSettled(teardown, { scope });

      await user.keyboard('iddqd');
      expect(listener).toBeCalledTimes(2);
    });

    test('DO NOT trigger after random typing', async () => {
      const start = createEvent();
      const typed = keyboard.sequence('randomstring');

      const listener = vi.fn();

      const user = userEvent.setup();

      const scope = fork();

      createWatch({ unit: typed, fn: listener, scope });

      await allSettled(start, { scope });

      await user.keyboard('iddqd');

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
