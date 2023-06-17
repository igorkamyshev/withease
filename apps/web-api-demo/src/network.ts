import { trackNetworkStatus } from '@withease/web-api';
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

appStarted();
