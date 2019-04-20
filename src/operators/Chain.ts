import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

/**
 * @ignore
 */
export class Chain<R1, R2, A1, A2> implements FIO<R1 & R2, A2> {
  public constructor(
    private readonly src: FIO<R1, A1>,
    private readonly ab: (a: A1) => FIO<R2, A2>
  ) {}

  public fork(env: R1 & R2, rej: REJ, res: RES<A2>, sh: IScheduler): Cancel {
    const cancellations = new Array<Cancel>()
    cancellations.push(
      this.src.fork(
        env,
        rej,
        a => {
          cancellations.push(this.ab(a).fork(env, rej, res, sh))
        },
        sh
      )
    )

    return () => {
      cancellations.forEach(_ => _())
    }
  }
}
