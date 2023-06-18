import { trackScreenOrientation } from '@withease/web-api';
import { createEvent } from 'effector';

const appStarted = createEvent();

const typeElement = document.querySelector('#type')!;
const angleElement = document.querySelector('#angle')!;

const { $type, $angle } = trackScreenOrientation({ setup: appStarted });

$type.watch((type) => {
  console.log('type', type);
  typeElement.textContent = JSON.stringify(type);
});
$angle.watch((angle) => {
  console.log('angle', angle);
  angleElement.textContent = JSON.stringify(angle);
});

appStarted();
