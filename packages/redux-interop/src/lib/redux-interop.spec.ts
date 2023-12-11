import { createReduxInterop } from './redux-interop';
import { legacy_createStore } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { createEvent, fork, allSettled } from 'effector';

describe('@withease/redux', () => {
  test('Should throw if setup is not an effector unit', () => {
    const reduxStore = legacy_createStore(() => ({}), {});
    const setup = () => {
      // ok
    };

    expect(() =>
      // @ts-expect-error - setup is not an effector unit
      createReduxInterop({ reduxStore, setup })
    ).toThrowErrorMatchingInlineSnapshot('"setup must be an effector unit"');
  });

  test('Should throw if reduxStore is not a Redux store', () => {
    const reduxStore = {};
    const setup = createEvent();

    expect(() =>
      // @ts-expect-error - reduxStore is not a Redux store
      createReduxInterop({ reduxStore, setup })
    ).toThrowErrorMatchingInlineSnapshot(
      '"reduxStore must be provided and should be a Redux store"'
    );
  });

  describe('raw Redux', () => {
    test('Should take redux store in', () => {
      const reduxStore = legacy_createStore(() => ({}), {});
      const setup = createEvent();
      const interop = createReduxInterop({ reduxStore, setup });
      setup();

      expect(interop.$store.getState()).toBe(reduxStore);
    });

    test('Should allow dispatching actions', () => {
      const reduxStore = legacy_createStore((_, x) => x, {});
      const setup = createEvent();
      const interop = createReduxInterop({ reduxStore, setup });
      setup();

      const action = { type: 'test' };
      interop.dispatch(action);

      expect(reduxStore.getState()).toEqual(action);
    });

    test('Should allow reading state', () => {
      const reduxStore = legacy_createStore((_, x) => ({
        value: (x as any).value || 'kek',
      }));
      const setup = createEvent();
      const interop = createReduxInterop({ reduxStore, setup });
      setup();

      const $state = interop.fromState((x) => x['value']);

      expect($state.getState()).toEqual('kek');

      reduxStore.dispatch({ type: 'test', value: 'lol' });

      expect($state.getState()).toEqual('lol');
    });

    test('Should work with Fork API', async () => {
      const reduxStore = legacy_createStore(() => ({}), {});
      const setup = createEvent();
      const interop = createReduxInterop({ reduxStore, setup });

      const $state = interop.fromState((x) => x['value']);

      const mockStore = legacy_createStore((_, x) => ({
        value: (x as any).value || 'kek',
      }));

      const scope = fork({
        values: [[interop.$store, mockStore]],
      });

      await allSettled(setup, { scope });

      expect(scope.getState($state)).toEqual('kek');

      await allSettled(interop.dispatch, {
        scope,
        params: { type: 'test', value: 'lol' },
      });

      expect(scope.getState($state)).toEqual('lol');
    });
  });
});