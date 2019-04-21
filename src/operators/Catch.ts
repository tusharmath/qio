import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

/**
 * @ignore
 */
export class Catch<R1, R2, A1, A2> implements FIO<R1 & R2, A1 | A2> {
  public constructor(
    private readonly src: FIO<R1, A1>,
    private readonly onError: (a: Error) => FIO<R2, A2>
  ) {}

  public fork(env: R1 & R2, rej: REJ, res: RES<A1 | A2>): Cancel {
    const cancellations = new Array<Cancel>()
    cancellations.push(
      this.src.fork(
        env,
        (err: Error) =>
          cancellations.push(this.onError(err).fork(env, rej, res)),
        res
      )
    )

    return () => cancellations.forEach(_ => _())
  }
}
