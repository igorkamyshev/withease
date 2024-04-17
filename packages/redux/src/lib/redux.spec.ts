import { createReduxIntegration } from './redux';
import { legacy_createStore } from 'redux';
import {
  configureStore,
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { call, take, put } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import {
  createEvent,
  fork,
  allSettled,
  createStore,
  sample,
  attach,
  combine,
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
    ).toThrowErrorMatchingInlineSnapshot(`[Error: setup must be an effector unit]`);
  });

  test('Should throw if reduxStore is not a Redux store', () => {
    const reduxStore = {};
    const setup = createEvent();

    expect(() =>
      // @ts-expect-error - reduxStore is not a Redux store
      createReduxIntegration({ reduxStore, setup })
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: reduxStore must be provided and should be a Redux store]`
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

      expect(interop.$reduxStore.getState()).toBe(reduxStore);
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

      const $state = combine(interop.$state, (x) => x.value);

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

      const $state = combine(interop.$state, (x) => x.value);

      const mockStore = legacy_createStore<
        { value: string },
        { type: string; value: string }
      >((_, x) => ({
        value: x.value || 'kek',
      }));

      const scope = fork({
        values: [[interop.$reduxStore, mockStore]],
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

      const $reduxCount = combine(interop.$state, (x) => x.c);

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
      const $test = combine(interop.$state, (x) => x.test);
      setup();

      expect(interop.$reduxStore.getState()).toBe(reduxStore);

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
      const $test = combine(interop.$state, (x) => x.test);

      const scope = fork({
        values: [[interop.$reduxStore, mockStore]],
      });

      await allSettled(setup, { scope });

      expect(scope.getState(interop.$reduxStore)).toBe(mockStore);

      expect(scope.getState($test)).toEqual('kek');
      expect($test.getState()).toEqual('');

      await allSettled(interop.dispatch, {
        scope,
        params: testSlice.actions.test(),
      });

      expect(scope.getState($test)).toEqual('lol');
      expect($test.getState()).toEqual('');
    });

    describe('Async Interop API object initialization', () => {
      test('Should allow not to pass reduxStore and use `null` as initial values', () => {
        const setup = createEvent<any>();
        const interop = createReduxIntegration({ setup });

        expect(interop.$reduxStore.getState()).toBe(null);
        expect(interop.$state.getState()).toBe(null);

        const scope = fork();

        expect(scope.getState(interop.$reduxStore)).toBe(null);
        expect(scope.getState(interop.$state)).toBe(null);
      });

      test('Should complain, if dispatch is called before store setup', async () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {
          // ok
        });

        const setup = createEvent<any>();
        const interop = createReduxIntegration({ setup });

        interop.dispatch({ type: 'test' });

        const scope = fork();

        await allSettled(interop.dispatch, { scope, params: { type: 'test' } });

        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls.map((x) => x[0])).toMatchInlineSnapshot(`
          [
            [Error: reduxStore must be provided and should be a Redux store],
            [Error: reduxStore must be provided and should be a Redux store],
          ]
        `);

        spy.mockRestore();
      });

      test('Should allow to setup redux store from setup event', async () => {
        const reduxStore = legacy_createStore<
          { value: string },
          { type: string; value: string }
        >((_, x) => ({
          value: x.value || 'kek',
        }));
        const setup = createEvent<typeof reduxStore>();
        const interop = createReduxIntegration({ setup });

        const scope = fork();

        expect(scope.getState(interop.$reduxStore)).toBe(null);
        expect(scope.getState(interop.$state)).toBe(null);

        await allSettled(setup, { scope, params: reduxStore });

        expect(scope.getState(interop.$reduxStore)).toBe(reduxStore);
        expect(scope.getState(interop.$state)).toEqual({ value: 'kek' });
      });
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
      const $test = combine(interop.$state, (x) => x.test);

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
        mapParams: (p: number) => lolThunk(p),
        effect: interop.dispatch,
      });

      const scope = fork({
        values: [
          [
            interop.$reduxStore,
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
      const $test = combine(interop.$state, (x) => x.test);

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
        mapParams: (p: number) => lolThunk(p),
        effect: interop.dispatch,
      });

      const scope = fork({
        values: [
          [
            interop.$reduxStore,
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

    describe('Redux Sagas', () => {
      test('Should allow calling events from sagas', async () => {
        const testEvent = createEvent<string>();
        const $test = createStore('kek').on(testEvent, (_, p) => p);

        const testSlice = createSlice({
          name: 'test',
          initialState: 'test',
          reducers: {
            test: () => 'test',
          },
        });

        function* lolSaga() {
          yield take(testSlice.actions.test.type);
          yield call(testEvent, 'lol');
        }

        const sagaMiddleware = createSagaMiddleware();

        const store = configureStore({
          reducer: {
            test: testSlice.reducer,
          },
          // @ts-expect-error - sagaMiddleware type is not compatible here for some reason :shrug:
          middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(sagaMiddleware),
        });

        sagaMiddleware.run(lolSaga);

        const setup = createEvent();
        const interop = createReduxIntegration({
          reduxStore: store,
          setup,
        });

        const doTest = interop.dispatch.prepend(testSlice.actions.test);

        const scope = fork();

        await allSettled(setup, { scope });

        expect(scope.getState($test)).toEqual('kek');

        await allSettled(doTest, { scope });

        expect(scope.getState($test)).toEqual('lol');
      });

      test('Should allow reading stores from sagas', async () => {
        const $someStore = createStore('kek');

        const testSlice = createSlice({
          name: 'test',
          initialState: 'kek',
          reducers: {
            test: () => 'test',
            change: (_, a) => a.payload,
          },
        });

        const sagaMiddleware = createSagaMiddleware();

        const store = configureStore({
          reducer: {
            test: testSlice.reducer,
          },
          // @ts-expect-error - sagaMiddleware type is not compatible here for some reason :shrug:
          middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(sagaMiddleware),
        });

        const setup = createEvent();
        const interop = createReduxIntegration({
          reduxStore: store,
          setup,
        });

        const $test = combine(interop.$state, (x) => x.test);

        function* lolSaga() {
          yield take(testSlice.actions.test.type);
          // @ts-expect-error - typescript having a hard time with generators
          const result = yield call(() => $someStore.getState());
          yield put(testSlice.actions.change(result));
        }

        sagaMiddleware.run(lolSaga);

        const doTest = interop.dispatch.prepend(testSlice.actions.test);

        const scope = fork({
          values: [[$someStore, 'lol']],
        });

        await allSettled(setup, { scope });

        expect(scope.getState($test)).toEqual('kek');

        await allSettled(doTest, { scope });

        expect(scope.getState($test)).toEqual('lol');
      });
    });
  });
});
