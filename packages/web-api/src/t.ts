import { createEvent } from 'effector';
import { trackMediaQuery } from './media_query';
import { TriggerProtocol } from './trigger_protocol';

const c = { setup: createEvent() };

const { m4, m5, __: mDef } = trackMediaQuery({ m4: 'ttt', m5: 'ttt' }, c);

// trigger

function wantTrigger(t: TriggerProtocol) {
  // ...
}

wantTrigger(trackMediaQuery('ttt'));
wantTrigger(trackMediaQuery({ desktop: 'ddd' }).desktop);
wantTrigger(trackMediaQuery({ desktop: 'ddd' }).__);
