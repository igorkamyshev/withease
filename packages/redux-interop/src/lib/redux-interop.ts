import type { Unit, Store, EventCallable } from 'effector';
import type { Store as ReduxStore, Action } from 'redux';
import {
  createStore,
  createEvent,
  is,
  sample,
  attach,
  scopeBind,
} from 'effector';

/**
 *
 * Utility function to create an Effector API to interact with Redux store,
 * useful for cases like soft migration from Redux to Effector.
 *
 * @param config {reduxStore: ReduxStore, setup: Unit<any>} - reduxStore is a redux store, setup is an effector unit which will setup subscription to the store
 * @returns Interop API object
 */
export function createReduxInterop<
  State = unknown,
  Act extends Action = { type: string; [k: string]: unknown },
  // eslint-disable-next-line @typescript-eslint/ban-types
  Ext extends {} = {}
>(config: {
  reduxStore: ReduxStore<State, Act, Ext>;
  // We don't care about the type of the setup unit here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup: Unit<any>;
}): {
  /**
   * Effector store containing the Redux store
   *
   * You can use it to substitute Redux store instance, while writing tests via Effector's Fork API
   * @example
   * ```
   * const scope = fork({
   *  values: [
   *   [reduxInterop.$store, reduxStoreMock]
   *  ]
   * })
   * ```
   */
  $store: Store<ReduxStore>;
  /**
   * Effector's event, which will trigger Redux store dispatch
   *
   * @example
   * ```
   * const updateName = reduxInterop.dispatch.prepend((name: string) => updateNameAction(name));
   * ```
   */
  dispatch: EventCallable<Act>;
  /**
   * Function to get Effector store containing selected part of the Redux store
   *
   * @example
   * ```
   * const $user = reduxInterop.fromState(state => state.user);
   * ```
   */
  fromState: <R>(selector: (state: State & Ext) => R) => Store<R>;
} {
  const { reduxStore, setup } = config;
  if (!is.unit(setup)) {
    throw new Error('setup must be an effector unit');
  }
  if (
    !reduxStore ||
    !reduxStore.dispatch ||
    !reduxStore.getState ||
    !reduxStore.subscribe
  ) {
    throw new Error('reduxStore must be provided and should be a Redux store');
  }

  const $store = createStore(reduxStore, {
    serialize: 'ignore',
    name: 'redux-interop/$store',
  });

  const stateUpdated = createEvent<State & Ext>();

  const $state = createStore<State & Ext>(reduxStore.getState(), {
    serialize: 'ignore',
    name: 'redux-interop/$state',
    skipVoid: false,
  }).on(stateUpdated, (_, state) => state);

  function fromState<R>(selector: (state: State & Ext) => R) {
    return $state.map(selector);
  }

  const dispatch = createEvent<Act>();
  const dispatchFx = attach({
    source: $store,
    effect(store, action: Act) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store.dispatch(action as any);
    },
  });

  sample({
    clock: dispatch,
    target: dispatchFx,
    // We should not batch dispatches, because redux store must see every action
    batch: false,
  });

  const reduxInteropSetupFx = attach({
    source: $store,
    effect(store) {
      const sendUpdate = scopeBind(stateUpdated, { safe: true });

      sendUpdate(store.getState());

      store.subscribe(() => {
        sendUpdate(store.getState());
      });
    },
  });

  sample({
    clock: setup,
    target: reduxInteropSetupFx,
  });

  /**
   * Logging any errors from the interop to the console for simplicity
   */
  sample({
    clock: [dispatchFx.failData, reduxInteropSetupFx.failData],
  }).watch(console.error);

  return {
    $store,
    dispatch,
    fromState,
  };
}
