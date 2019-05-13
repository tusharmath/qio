import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {Runtime} from '../runtimes/Runtime'

class ChainHandler<R1, R2, E1, E2, A1, A2> {
  public constructor(
    private readonly env: R1 & R2,
    private readonly reject: CB<E1 | E2>,
    private readonly resolve: CB<A2>,
    private readonly runtime: Runtime,
    private readonly cancellations: Cancel[],
    private readonly aFb: (e: A1) => IFIO<R2, E2, A2>
  ) {}

  public onResolve = (a: A1) => {
    try {
      this.cancellations.push(
        this.aFb(a).fork(this.env, this.reject, this.resolve, this.runtime)
      )
    } catch (e) {
      this.reject(e as E2)
    }
  }
}

/**
 * @ignore
 */
export class Chain<R1, R2, E1, E2, A1, A2>
  implements IFIO<R1 & R2, E1 | E2, A2> {
  public constructor(
    private readonly src: IFIO<R1, E1, A1>,
    private readonly ab: (a: A1) => IFIO<R2, E2, A2>
  ) {}

  public fork(
    env: R1 & R2,
    rej: CB<E1 | E2>,
    res: CB<A2>,
    runtime: Runtime
  ): Cancel {
    const cancellations = new Array<Cancel>()

    cancellations.push(
      // Async scheduling is done to avail stack safety inside chain
      runtime.scheduler.asap(() => {
        cancellations.push(
          this.src.fork(
            env,
            rej,
            new ChainHandler<R1, R2, E1, E2, A1, A2>(
              env,
              rej,
              res,
              runtime,
              cancellations,
              this.ab
            ).onResolve,
            runtime
          )
        )
      })
    )

    return () => {
      cancellations.forEach(_ => _())
    }
  }
}
