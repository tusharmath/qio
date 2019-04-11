import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {XIO} from '../internals/XIO'

export class Chain<A, B> implements XIO<B> {
  public constructor(
    private readonly src: XIO<A>,
    private readonly ab: (a: A) => XIO<B>
  ) {}

  public fork(sh: IScheduler, rej: REJ, res: RES<B>): Cancel {
    const cancellations = new Array<Cancel>()
    cancellations.push(
      this.src.fork(sh, rej, a => {
        cancellations.push(this.ab(a).fork(sh, rej, res))
      })
    )

    return () => {
      cancellations.forEach(_ => _())
    }
  }
}
