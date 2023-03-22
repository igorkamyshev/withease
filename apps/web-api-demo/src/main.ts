import { trackNetworkStatus, trackPageVisibility } from '@withease/web-api';
import { createEvent } from 'effector';

const appStarted = createEvent();

// Network status

const network = trackNetworkStatus({ setup: appStarted });

const onlineElement = document.querySelector('#online')!;
const offlineElement = document.querySelector('#offline')!;

network.$online.watch((online) => {
  console.log('online', online);
  onlineElement.textContent = JSON.stringify(online);
});
network.$offline.watch((offline) => {
  console.log('offline', offline);
  offlineElement.textContent = JSON.stringify(offline);
});

// Page visibility

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

// Start

appStarted();
