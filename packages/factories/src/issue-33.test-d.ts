import { describe, test, expectTypeOf } from 'vitest';
import {
  type Validator,
  type SourcedField,
  type DynamicallySourcedField,
  type ParamsDeclaration,
  type Query,
} from '@farfetched/core';
import { type Json, type Store } from 'effector';
import { type Runtype, Record, Number } from 'runtypes';

import { createFactory } from './create_factory';
import { invoke } from './invoke';

describe('factories, issue #33', () => {
  test('infer complex type', () => {
    const createAriadneQuery = createFactory(ariadneData);

    const resultQuery = invoke(() =>
      createAriadneQuery({
        graphQL: {
          query: 'Some Query',
          operationName: 'map_v2',
          variables: {} as Store<Json>,
        },
        contract: Record({ map_v2: Record({ val: Number }) }),
        mapData: (response) => response.map_v2,
      })
    );

    expectTypeOf(resultQuery).toMatchTypeOf<
      Query<
        void,
        {
          val: number;
        },
        unknown,
        null
      >
    >();
  });
});

interface BaseAriadneDataConfig<
  Params,
  P,
  D,
  S,
  ValidatorSource = void,
  OperatorSource = void
> {
  graphQL: {
    query: string;
    variables?: SourcedField<Params, Json, OperatorSource>;
    operationName: string;
  };
  contract: Runtype<P>;
  mapData: DynamicallySourcedField<P, D, S>;
  validate?: Validator<{ data: P }, Params, ValidatorSource>;

  enabled?: Store<boolean>;
}

// With params and no initialData
function ariadneData<
  Params,
  P,
  D,
  S,
  ValidatorSource = void,
  OperatorSource = void
>(
  config: { params: ParamsDeclaration<Params> } & BaseAriadneDataConfig<
    Params,
    P,
    D,
    S,
    ValidatorSource,
    OperatorSource
  >
): Query<Params, D, unknown>;

// no params and no initialData
function ariadneData<
  _Params,
  P,
  D,
  S,
  ValidatorSource = void,
  OperatorSource = void
>(
  config: BaseAriadneDataConfig<void, P, D, S, ValidatorSource, OperatorSource>
): Query<void, D, unknown>;

// With params and initialData
function ariadneData<
  Params,
  P,
  D,
  S,
  ValidatorSource = void,
  OperatorSource = void
>(
  config: {
    initialData: D;
    params: ParamsDeclaration<Params>;
  } & BaseAriadneDataConfig<Params, P, D, S, ValidatorSource, OperatorSource>
): Query<Params, D, unknown, D>;

// no params and initialData
function ariadneData<
  _Params,
  P,
  D,
  S,
  ValidatorSource = void,
  OperatorSource = void
>(
  config: {
    initialData: D;
  } & BaseAriadneDataConfig<void, P, D, S, ValidatorSource, OperatorSource>
): Query<void, D, unknown, D>;

function ariadneData(config: any): any {
  return {} as any;
}
