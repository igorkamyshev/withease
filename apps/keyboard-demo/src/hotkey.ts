import { trackKeyboard } from '@withease/keyboard';
import { createEvent } from 'effector';

const appStarted = createEvent();

const keyboard = trackKeyboard({ setup: appStarted });

appStarted();
