import { type Store } from 'effector';

import { type Setupable } from './shared';
import { type TriggerProtocol } from './trigger_protocol';

type Result = {
  $active: Store<boolean>;
  $inactive: Store<boolean>;
};

type Query = string;

function trackMediaQuery(mq: Query, c: Setupable): Result;
function trackMediaQuery(
  mq: Query
): ((c: Setupable) => Result) & TriggerProtocol;

function trackMediaQuery(mq: Array<Query>, c: Setupable): Array<Result>;
function trackMediaQuery(
  mq: Array<Query>
): Array<((c: Setupable) => Result) & TriggerProtocol>;

function trackMediaQuery<T extends Record<string, Query>>(
  mq: T,
  c: Setupable
): { [key in keyof T]: Result } & { __: Result };
function trackMediaQuery<T extends Record<string, Query>>(
  mq: T
): { [key in keyof T]: ((c: Setupable) => Result) & TriggerProtocol } & {
  __: ((c: Result) => Result) & TriggerProtocol;
};

function trackMediaQuery(...args: any[]): any {
  return {};
}

export { trackMediaQuery };
