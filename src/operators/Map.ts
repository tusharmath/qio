import {Cancel} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {SafeResolve} from '../internals/SafeResolve'

/**
 * @ignore
 */
export class Map<R, E, A, B> implements FIO<R, E, B> {
  public constructor(
    private readonly src: FIO<R, E, A>,
    private readonly ab: (a: A) => B
  ) {}

  public fork(env: R, rej: REJ<E>, res: RES<B>): Cancel {
    return this.src.fork(env, rej, a => SafeResolve(this.ab(a), rej, res))
  }
}
