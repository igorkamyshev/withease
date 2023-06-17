import { trackPageVisibility } from '@withease/web-api';
import { createEvent } from 'effector';

const appStarted = createEvent();

const visibleElement = document.querySelector('#visible')!;
const hiddenElement = document.querySelector('#hidden')!;

const page = trackPageVisibility({ setup: appStarted });

page.$visible.watch((visible) => {
  console.log('visible', visible);
  visibleElement.textContent = JSON.stringify(visible);
});
page.$hidden.watch((hidden) => {
  console.log('hidden', hidden);
  hiddenElement.textContent = JSON.stringify(hidden);
});

appStarted();
