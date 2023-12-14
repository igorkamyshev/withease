import type { Unit, Store, Effect } from 'effector';
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
 * Type for any thunk-like thing, which can be dispatched to Redux store
 *
 * Since generally Thunk is a any function, we can't type it properly
 */
type AnyThunkLikeThing = (...args: any[]) => any;

/**
 *
 * Utility function to create an Effector API to interact with Redux store,
 * useful for cases like soft migration from Redux to Effector.
 *
 * @param config - interop config
 * @param config.reduxStore - a redux store
 * @param config.setup - effector unit which will setup subscription to the store
 * @returns Interop API object
 */
export function createReduxIntegration<
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
   *   [reduxInterop.$reduxStore, reduxStoreMock]
   *  ]
   * })
   * ```
   */
  $reduxStore: Store<ReduxStore>;
  /**
   * Effector's event, which will trigger Redux store dispatch
   *
   * @example
   * ```
   * const updateName = reduxInterop.dispatch.prepend((name: string) => updateNameAction(name));
   * ```
   */
  dispatch: Effect<Act | AnyThunkLikeThing, unknown, Error>;
  /**
   * Effector store containing the state of the Redux store
   *
   * You can use it to subscribe to the Redux store state changes in Effector
   * @example
   * ```
   * const $userName = combine(reduxInterop.$state, state => state.user.name)
   * ```
   */
  $state: Store<State & Ext>;
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

  const $reduxStore = createStore(reduxStore, {
    serialize: 'ignore',
    name: 'redux/$reduxStore',
  });

  const stateUpdated = createEvent<State & Ext>();

  const $state = createStore<State & Ext>(reduxStore.getState() ?? null, {
    serialize: 'ignore',
    name: 'redux/$state',
    skipVoid: false,
  }).on(stateUpdated, (_, state) => state);

  const dispatchFx = attach({
    source: $reduxStore,
    effect(store, action: Act | AnyThunkLikeThing) {
      return store.dispatch(action as Act) as unknown;
    },
  });

  const reduxInteropSetupFx = attach({
    source: $reduxStore,
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
    $reduxStore,
    dispatch: dispatchFx,
    $state,
  };
}
