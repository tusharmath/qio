import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {DefaultRuntime} from '../runtimes/DefaultRuntime'

/**
 * @ignore
 */
export class Catch<R1, R2, E1, E2, A1, A2>
  implements IFIO<R1 & R2, E2, A1 | A2> {
  public constructor(
    private readonly src: IFIO<R1, E1, A1>,
    private readonly onError: (a: E1) => IFIO<R2, E2, A2>
  ) {}

  public fork(
    env: R1 & R2,
    rej: CB<E2>,
    res: CB<A1 | A2>,
    runtime: DefaultRuntime
  ): Cancel {
    const cancellations = new Array<Cancel>()
    cancellations.push(
      this.src.fork(
        env,
        err =>
          cancellations.push(this.onError(err).fork(env, rej, res, runtime)),
        res,
        runtime
      )
    )

    return () => cancellations.forEach(_ => _())
  }
}
