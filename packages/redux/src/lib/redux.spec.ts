import { createReduxIntegration } from './redux';
import { UnknownAction, legacy_createStore } from 'redux';
import {
  configureStore,
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {
  createEvent,
  fork,
  allSettled,
  createStore,
  sample,
  attach,
} from 'effector';

describe('@withease/redux', () => {
  test('Should throw if setup is not an effector unit', () => {
    const reduxStore = legacy_createStore(() => ({}), {});
    const setup = () => {
      // ok
    };

    expect(() =>
      // @ts-expect-error - setup is not an effector unit
      createReduxIntegration({ reduxStore, setup })
    ).toThrowErrorMatchingInlineSnapshot('"setup must be an effector unit"');
  });

  test('Should throw if reduxStore is not a Redux store', () => {
    const reduxStore = {};
    const setup = createEvent();

    expect(() =>
      // @ts-expect-error - reduxStore is not a Redux store
      createReduxIntegration({ reduxStore, setup })
    ).toThrowErrorMatchingInlineSnapshot(
      '"reduxStore must be provided and should be a Redux store"'
    );
  });

  test('Any errors are logged into console', () => {
    const fakeStore = {
      dispatch: () => {
        throw new Error('fake dispatch!');
      },
      getState: () => {
        return {};
      },
      subscribe: () => {
        throw new Error('fake subscribe!');
      },
    };

    const setup = createEvent();

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {
      // ok
    });

    // @ts-expect-error - fakeStore is not a Redux store
    const int = createReduxIntegration({ reduxStore: fakeStore, setup });

    expect(spy.mock.calls.map((x) => x[0])).toMatchInlineSnapshot('[]');

    setup();

    expect(spy.mock.calls.map((x) => x[0])).toMatchInlineSnapshot(`
      [
        [Error: fake subscribe!],
      ]
    `);

    int.dispatch({ type: 'kek' });

    expect(spy.mock.calls.map((x) => x[0])).toMatchInlineSnapshot(`
      [
        [Error: fake subscribe!],
        [Error: fake dispatch!],
      ]
    `);

    spy.mockRestore();
  });

  describe('raw Redux', () => {
    test('Should take redux store in', () => {
      const reduxStore = legacy_createStore(() => ({}), {});
      const setup = createEvent();
      const interop = createReduxIntegration({ reduxStore, setup });
      setup();

      expect(interop.$store.getState()).toBe(reduxStore);
    });

    test('Should allow dispatching actions', () => {
      const reduxStore = legacy_createStore((_, x) => x, {});
      const setup = createEvent();
      const interop = createReduxIntegration({ reduxStore, setup });
      setup();

      const action = { type: 'test' };
      interop.dispatch(action);

      expect(reduxStore.getState()).toEqual(action);
    });

    test('Should allow reading state', () => {
      const reduxStore = legacy_createStore<
        { value: string },
        { type: string; value: string }
      >((_, x) => ({
        value: x.value || 'kek',
      }));
      const setup = createEvent();
      const interop = createReduxIntegration({ reduxStore, setup });
      setup();

      const $state = interop.fromState((x) => x.value);

      expect($state.getState()).toEqual('kek');

      reduxStore.dispatch({ type: 'test', value: 'lol' });

      expect($state.getState()).toEqual('lol');
    });

    test('Should work with Fork API', async () => {
      const reduxStore = legacy_createStore<
        { value: string },
        { type: string; value: string }
      >(() => ({ value: '' }), { value: '' });
      const setup = createEvent();
      const interop = createReduxIntegration({ reduxStore, setup });

      const $state = interop.fromState((x) => x.value);

      const mockStore = legacy_createStore<
        { value: string },
        { type: string; value: string }
      >((_, x) => ({
        value: x.value || 'kek',
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

    test('edge case: should allow synchronous cycle update', async () => {
      /**
       * This is an edge case, where we have a cycle between effector and redux,
       * it is useful for cases, when a feature is not entierly migrated to effector,
       * so it is still needed to keep redux and effector parts in sync.
       */

      const reduxStore = legacy_createStore<
        { c: number },
        { type: string; c: number }
      >((s, a) => ({ c: (s || { c: 0 }).c + (a.c || 0) }), { c: 0 });

      const setup = createEvent();
      const interop = createReduxIntegration({
        reduxStore,
        setup,
      });

      const updateCount = createEvent<number>();
      const $count = createStore(0).on(updateCount, (s, a) => s + a);

      const $reduxCount = interop.fromState((x) => x.c);

      // effector updates redux
      const updateReduxCount = interop.dispatch.prepend((x: number) => ({
        type: 'test',
        c: x,
      }));
      sample({
        clock: $count,
        source: $reduxCount,
        filter: (r, e) => r !== e,
        fn: (_r, e) => e,
        target: updateReduxCount,
      });

      // redux updates effector - cycle
      sample({
        clock: $reduxCount,
        source: $count,
        filter: (r, e) => r !== e,
        fn: (_s, reduxCount) => reduxCount,
        target: $count,
      });

      const scope = fork();

      expect(scope.getState($count)).toEqual(0);
      expect(scope.getState($reduxCount)).toEqual(0);

      await allSettled(setup, { scope });

      await allSettled(updateCount, {
        scope,
        params: 1,
      });

      expect(scope.getState($count)).toEqual(1);
      expect(scope.getState($reduxCount)).toEqual(1);

      await allSettled(updateReduxCount, {
        scope,
        params: 1,
      });

      expect(scope.getState($count)).toEqual(2);
      expect(scope.getState($reduxCount)).toEqual(2);
    });
  });

  describe('Redux Toolkit', () => {
    test('Should work with basic Redux Toolkit', () => {
      const testSlice = createSlice({
        name: 'test',
        initialState: 'kek',
        reducers: {
          test: () => 'lol',
        },
      });
      const reduxStore = configureStore({
        reducer: {
          test: testSlice.reducer,
        },
      });
      const setup = createEvent();
      const interop = createReduxIntegration({ reduxStore, setup });
      const $test = interop.fromState((x) => x.test);
      setup();

      expect(interop.$store.getState()).toBe(reduxStore);

      expect($test.getState()).toEqual('kek');

      interop.dispatch(testSlice.actions.test());

      expect($test.getState()).toEqual('lol');
    });

    test('Should work with Fork API', async () => {
      const reduxStore = legacy_createStore<{ test: string }, { type: string }>(
        () => ({ test: '' }),
        { test: '' }
      );

      const testSlice = createSlice({
        name: 'test',
        initialState: 'kek',
        reducers: {
          test: () => 'lol',
        },
      });
      const mockStore = configureStore({
        reducer: {
          test: testSlice.reducer,
        },
      });
      const setup = createEvent();
      const interop = createReduxIntegration({ reduxStore, setup });
      const $test = interop.fromState((x) => x.test);

      const scope = fork({
        values: [[interop.$store, mockStore]],
      });

      await allSettled(setup, { scope });

      expect(scope.getState(interop.$store)).toBe(mockStore);

      expect(scope.getState($test)).toEqual('kek');
      expect($test.getState()).toEqual('');

      await allSettled(interop.dispatch, {
        scope,
        params: testSlice.actions.test(),
      });

      expect(scope.getState($test)).toEqual('lol');
      expect($test.getState()).toEqual('');
    });

    test('Should support redux-thunks', async () => {
      const testSlice = createSlice({
        name: 'test',
        initialState: 'kek',
        reducers: {
          test: () => 'lol',
        },
      });
      const reduxStore = configureStore({
        reducer: {
          test: testSlice.reducer,
        },
      });
      const setup = createEvent();
      const interop = createReduxIntegration({ reduxStore, setup });
      const $test = interop.fromState((x) => x.test);

      const lolThunk = (p: number) => async (dispatch: any) => {
        await new Promise((resolve) => setTimeout(resolve, p));

        return dispatch(testSlice.actions.test());
      };

      /**
       * This is a redux-thunk, converted into an effector Effect.
       *
       * This allows gradual migration from redux-thunks to effector Effects
       */
      const lolThunkFx = attach({
        // thunk is not explicitly a redux action
        mapParams: (p: number) => lolThunk(p) as unknown as UnknownAction,
        effect: interop.dispatch,
      });

      const scope = fork({
        values: [
          [
            interop.$store,
            // Independent copy of original store
            configureStore({
              reducer: {
                test: testSlice.reducer,
              },
            }),
          ],
        ],
      });

      expect(scope.getState($test)).toEqual('kek');
      expect($test.getState()).toEqual('kek'); // non-scope state

      await allSettled(setup, { scope });

      await allSettled(lolThunkFx, {
        scope,
        params: 100,
      });

      expect(scope.getState($test)).toEqual('lol');
      expect($test.getState()).toEqual('kek'); // non-scope state should not have changed
    });

    test('Should support RTK Async Thunks', async () => {
      const testSlice = createSlice({
        name: 'test',
        initialState: 'kek',
        reducers: {
          test: () => 'lol',
        },
      });
      const reduxStore = configureStore({
        reducer: {
          test: testSlice.reducer,
        },
      });
      const setup = createEvent();
      const interop = createReduxIntegration({ reduxStore, setup });
      const $test = interop.fromState((x) => x.test);

      const lolThunk = createAsyncThunk(
        'test/lol',
        async (p: number, { dispatch }) => {
          await new Promise((resolve) => setTimeout(resolve, p));

          return dispatch(testSlice.actions.test());
        }
      );

      /**
       * This is a redux-thunk, converted into an effector Effect.
       *
       * This allows gradual migration from redux-thunks to effector Effects
       */
      const lolThunkFx = attach({
        // thunk is not explicitly a redux action
        mapParams: (p: number) => lolThunk(p) as unknown as UnknownAction,
        effect: interop.dispatch,
      });

      const scope = fork({
        values: [
          [
            interop.$store,
            // Independent copy of original store
            configureStore({
              reducer: {
                test: testSlice.reducer,
              },
            }),
          ],
        ],
      });

      expect(scope.getState($test)).toEqual('kek');
      expect($test.getState()).toEqual('kek'); // non-scope state

      await allSettled(setup, { scope });

      await allSettled(lolThunkFx, {
        scope,
        params: 100,
      });

      expect(scope.getState($test)).toEqual('lol');
      expect($test.getState()).toEqual('kek'); // non-scope state should not have changed
    });
  });
});
