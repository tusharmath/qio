import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

class CatchHandler<R1, R2, E1, E2, A1, A2> {
  public constructor(
    private readonly env: R1 & R2,
    private readonly reject: CB<E2>,
    private readonly resolve: CB<A1 | A2>,
    private readonly runtime: Runtime,
    private readonly cancellations: Cancel[],
    private readonly onError: (e: E1) => FIO<R2, E2, A2>
  ) {}

  public catch = (e: E1) => {
    this.cancellations.push(
      this.onError(e).fork(this.env, this.reject, this.resolve, this.runtime)
    )
  }
}

/**
 * @ignore
 */
export class Catch<R1, R2, E1, E2, A1, A2> extends FIO<R1 & R2, E2, A1 | A2> {
  public constructor(
    private readonly src: FIO<R1, E1, A1>,
    private readonly onError: (a: E1) => FIO<R2, E2, A2>
  ) {
    super()
  }

  public fork(
    env: R1 & R2,
    rej: CB<E2>,
    res: CB<A1 | A2>,
    runtime: Runtime
  ): Cancel {
    const cancellations = new Array<Cancel>()

    cancellations.push(
      this.src.fork(
        env,
        new CatchHandler<R1, R2, E1, E2, A1, A2>(
          env,
          rej,
          res,
          runtime,
          cancellations,
          this.onError
        ).catch,
        res,
        runtime
      )
    )

    return () => cancellations.forEach(_ => _())
  }
}
