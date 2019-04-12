import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

export class Chain<A, B> implements FIO<B> {
  public constructor(
    private readonly src: FIO<A>,
    private readonly ab: (a: A) => FIO<B>
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
