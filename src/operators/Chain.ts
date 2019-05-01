import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {FIO} from '../internals/FIO'

/**
 * @ignore
 */
export class Chain<R1, R2, E1, E2, A1, A2>
  implements FIO<R1 & R2, E1 | E2, A2> {
  public constructor(
    private readonly src: FIO<R1, E1, A1>,
    private readonly ab: (a: A1) => FIO<R2, E2, A2>
  ) {}

  public fork(env: R1 & R2, rej: CB<E1 | E2>, res: CB<A2>): Cancel {
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
