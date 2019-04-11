import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {XIO} from '../internals/XIO'

export class Catch<A, B> implements XIO<A | B> {
  public constructor(
    private readonly src: XIO<A>,
    private readonly onError: (a: Error) => XIO<B>
  ) {}

  public fork(sh: IScheduler, rej: REJ, res: RES<A | B>): Cancel {
    return this.src.fork(
      sh,
      (err: Error) => this.onError(err).fork(sh, rej, res),
      res
    )
  }
}
