import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {SafeResolve} from '../internals/SafeResolve'
import {DefaultRuntime} from '../runtimes/DefaultRuntime'

/**
 * @ignore
 */
export class Map<R, E, A, B> implements IFIO<R, E, B> {
  public constructor(
    private readonly src: IFIO<R, E, A>,
    private readonly ab: (a: A) => B
  ) {}

  public fork(env: R, rej: CB<E>, res: CB<B>, runtime: DefaultRuntime): Cancel {
    return this.src.fork(
      env,
      rej,
      a => SafeResolve(this.ab(a), rej, res),
      runtime
    )
  }
}
