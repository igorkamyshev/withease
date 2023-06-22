import { trackPreferredLanguages } from '@withease/web-api';
import { createEvent } from 'effector';

const appStarted = createEvent();

const languageElement = document.querySelector('#language')!;

const { $language } = trackPreferredLanguages({ setup: appStarted });

$language.watch((language) => {
  console.log('language', language);
  languageElement.textContent = language;
});

appStarted();
