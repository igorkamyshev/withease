import { Store } from 'effector';
import { Setupable, createAutoUpdatedStore, readValue } from 'shared';

const on = <
  E extends { addEventListener: Function; removeEventListener: Function }
>(
  element: E,
  type: string,
  handler: Function
) => {
  element.addEventListener(type, handler);

  return () => {
    element.removeEventListener(type, handler);
  };
};

type WindowDimensions = ({ setup, teardown }: Setupable) => {
  $scrollX: Store<number>;
  $scrollY: Store<number>;
  $innerWidth: Store<number>;
  $innerHeight: Store<number>;
  $outerWidth: Store<number>;
  $outerHeight: Store<number>;
  $screenTop: Store<number>;
  $screenLeft: Store<number>;
};

const trackWindowDimensions: WindowDimensions = (config) => {
  const storeWithUpdate = createAutoUpdatedStore(config);

  const $scrollX = storeWithUpdate(
    () => readValue(() => window.scrollX, 0),
    (update) => on(document, 'scroll', update)
  );

  const $scrollY = storeWithUpdate(
    () => readValue(() => window.scrollY, 0),
    (update) => on(document, 'scroll', update)
  );

  const $innerWidth = storeWithUpdate(
    () => readValue(() => window.innerWidth, 0),
    (update) => on(window, 'resize', update)
  );

  const $innerHeight = storeWithUpdate(
    () => readValue(() => window.innerHeight, 0),
    (update) => on(window, 'resize', update)
  );

  const $outerWidth = storeWithUpdate(
    () => readValue(() => window.outerWidth, 0),
    (update) => on(window, 'resize', update)
  );

  const $outerHeight = storeWithUpdate(
    () => readValue(() => window.outerHeight, 0),
    (update) => on(window, 'resize', update)
  );

  const $screenTop = storeWithUpdate(
    () => readValue(() => window.screenTop, 0),
    (update) => {
      let value = window.screenTop;

      let frame = window.requestAnimationFrame(function check() {
        frame = window.requestAnimationFrame(check);

        if (value !== (value = window.screenTop)) {
          update();
        }
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }
  );

  const $screenLeft = storeWithUpdate(
    () => readValue(() => window.screenLeft, 0),
    (update) => {
      let value = window.screenLeft;

      let frame = window.requestAnimationFrame(function check() {
        frame = window.requestAnimationFrame(check);

        if (value !== (value = window.screenLeft)) {
          update();
        }
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }
  );

  return {
    $scrollX,
    $scrollY,
    $innerWidth,
    $innerHeight,
    $outerWidth,
    $outerHeight,
    $screenTop,
    $screenLeft,
  };
};

export { trackWindowDimensions };
