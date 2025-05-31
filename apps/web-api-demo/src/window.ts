import { trackWindowDimensions } from '@withease/web-api';
import { Store, createEvent } from 'effector';

const bindStoreToElement = (store: Store<number>, elementId: string) => {
  const element = document.querySelector(elementId)!;

  store.watch((value) => {
    element.textContent = JSON.stringify(value);
  });
};

const appStarted = createEvent();

const {
  $scrollY,
  $scrollX,
  $innerWidth,
  $innerHeight,
  $outerWidth,
  $outerHeight,
  $screenLeft,
  $screenTop,
} = trackWindowDimensions({
  setup: appStarted,
});

bindStoreToElement($scrollY, '#scrollY');
bindStoreToElement($scrollX, '#scrollX');
bindStoreToElement($innerWidth, '#innerWidth');
bindStoreToElement($innerHeight, '#innerHeight');
bindStoreToElement($outerWidth, '#outerWidth');
bindStoreToElement($outerHeight, '#outerHeight');
bindStoreToElement($screenLeft, '#screenLeft');
bindStoreToElement($screenTop, '#screenTop');

appStarted();
