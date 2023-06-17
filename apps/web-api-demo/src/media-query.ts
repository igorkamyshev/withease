import { trackMediaQuery } from '@withease/web-api';
import { createEvent } from 'effector';

const appStarted = createEvent();

const mobileElement = document.querySelector('#mobile')!;
const desktopElement = document.querySelector('#desktop')!;

const { mobile, desktop } = trackMediaQuery(
  { desktop: '(min-width: 601px)', mobile: '(max-width: 600px)' },
  { setup: appStarted }
);

mobile.$matches.watch((active) => {
  console.log('mobile', active);
  mobileElement.textContent = JSON.stringify(active);
});
desktop.$matches.watch((inactive) => {
  console.log('desktop', inactive);
  desktopElement.textContent = JSON.stringify(inactive);
});

appStarted();
