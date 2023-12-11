import type { Unit } from 'effector';
import type { Store as ReduxStore } from 'redux';
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
  BaseState = unknown,
  // Record type is used here instead of UnknownAction, because compatibility with redux ^4.0.0 is also needed
  Action = Record<string, unknown>,
  StateExt = Record<string, unknown>
>(config: {
  reduxStore: ReduxStore;
  // We don't care about the type of the setup unit here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup: Unit<any>;
}) {
  type State = BaseState & StateExt;

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
  const $state = createStore<State>(reduxStore.getState(), {
    serialize: 'ignore',
    name: 'redux-interop/$state',
  });

  function fromState<R>(selector: (state: State) => R) {
    return $state.map(selector);
  }

  const dispatch = createEvent<Action>();
  const dispatchFx = attach({
    source: $store,
    effect(store, action: Action) {
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

  const stateUpdated = createEvent<State>();

  const reduxInteropSetupFx = attach({
    source: $store,
    effect(store) {
      const sendUpdate = scopeBind(stateUpdated, { safe: true });
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
    $store,
    /**
     * Effector's event, which will trigger Redux store dispatch
     * 
     * @example
     * ```
     * const updateName = reduxInterop.dispatch.prepend((name: string) => updateNameAction(name));
     * ```
     */
    dispatch,
    /**
     * Function to get Effector store containing selected part of the Redux store
     * 
     * @example
     * ```
     * const $user = reduxInterop.fromState(state => state.user);
     * ```
     */
    fromState,
  };
}
