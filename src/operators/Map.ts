import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {SafeResolve} from '../internals/SafeResolve'

/**
 * @ignore
 */
export class Map<R, A, B> implements FIO<R, B> {
  public constructor(
    private readonly src: FIO<R, A>,
    private readonly ab: (a: A) => B
  ) {}

  public fork(sh: IScheduler, env: R, rej: REJ, res: RES<B>): Cancel {
    return this.src.fork(sh, env, rej, a => SafeResolve(this.ab(a), rej, res))
  }
}
