import { createEvent } from 'effector';
import { trackMediaQuery } from './media_query';
import { TriggerProtocol } from './trigger_protocol';

const c = { setup: createEvent() };

const m1 = trackMediaQuery('ttt', c);
const [m2, m3] = trackMediaQuery(['ttt', 'ttt'], c);

const { m4, m5, __: mDef } = trackMediaQuery({ m4: 'ttt', m5: 'ttt' }, c);

// trigger

function wantTrigger(t: TriggerProtocol) {
  // ...
}

wantTrigger(trackMediaQuery('ttt'));
wantTrigger(trackMediaQuery(['ttt', 'ttt'])[0]);
wantTrigger(trackMediaQuery({ desktop: 'ddd' }).desktop);
wantTrigger(trackMediaQuery({ desktop: 'ddd' }).__);
