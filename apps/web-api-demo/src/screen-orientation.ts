import { trackScreenOrientation } from '@withease/web-api';
import { createEvent } from 'effector';

const appStarted = createEvent();

const typeElement = document.querySelector('#type')!;
const angleElement = document.querySelector('#angle')!;
const portraitElement = document.querySelector('#portrait')!;
const landscapeElement = document.querySelector('#landscape')!;

const { $type, $angle, $landscape, $portrait } = trackScreenOrientation({
  setup: appStarted,
});

$type.watch((type) => {
  console.log('type', type);
  typeElement.textContent = JSON.stringify(type);
});
$angle.watch((angle) => {
  console.log('angle', angle);
  angleElement.textContent = JSON.stringify(angle);
});
$landscape.watch((landscape) => {
  console.log('landscape', landscape);
  landscapeElement.textContent = JSON.stringify(landscape);
});
$portrait.watch((portrait) => {
  console.log('portrait', portrait);
  portraitElement.textContent = JSON.stringify(portrait);
});

appStarted();
