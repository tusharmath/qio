import {Cancel} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

/**
 * @ignore
 */
export class Chain<R1, R2, E1, E2, A1, A2>
  implements FIO<R1 & R2, E1 | E2, A2> {
  public constructor(
    private readonly src: FIO<R1, E1, A1>,
    private readonly ab: (a: A1) => FIO<R2, E2, A2>
  ) {}

  public fork(env: R1 & R2, rej: REJ<E1 | E2>, res: RES<A2>): Cancel {
    const cancellations = new Array<Cancel>()
    cancellations.push(
      this.src.fork(env, rej, a => {
        cancellations.push(this.ab(a).fork(env, rej, res))
      })
    )

    return () => {
      cancellations.forEach(_ => _())
    }
  }
}
