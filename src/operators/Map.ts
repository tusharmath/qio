import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {XIO} from '../internals/XIO'

export class Map<A, B> implements XIO<B> {
  public constructor(
    private readonly src: XIO<A>,
    private readonly ab: (a: A) => B
  ) {}

  public fork(sh: IScheduler, rej: REJ, res: RES<B>): Cancel {
    return this.src.fork(sh, rej, a => res(this.ab(a)))
  }
}
