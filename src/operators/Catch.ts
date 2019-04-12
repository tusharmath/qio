import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

export class Catch<A, B> implements FIO<A | B> {
  public constructor(
    private readonly src: FIO<A>,
    private readonly onError: (a: Error) => FIO<B>
  ) {}

  public fork(sh: IScheduler, rej: REJ, res: RES<A | B>): Cancel {
    return this.src.fork(
      sh,
      (err: Error) => this.onError(err).fork(sh, rej, res),
      res
    )
  }
}
