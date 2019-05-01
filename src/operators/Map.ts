import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {FIO} from '../internals/FIO'
import {SafeResolve} from '../internals/SafeResolve'

/**
 * @ignore
 */
export class Map<R, E, A, B> implements FIO<R, E, B> {
  public constructor(
    private readonly src: FIO<R, E, A>,
    private readonly ab: (a: A) => B
  ) {}

  public fork(env: R, rej: CB<E>, res: CB<B>): Cancel {
    return this.src.fork(env, rej, a => SafeResolve(this.ab(a), rej, res))
  }
}
