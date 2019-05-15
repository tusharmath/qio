import {ICancellable, IExecutable} from 'ts-scheduler'
import {CancellationList} from '../cancellables/CancellationList'
import {CB} from '../internals/CB'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

class ChainHandler<R1, R2, E1, E2, A1, A2> {
  public constructor(
    private readonly env: R1 & R2,
    private readonly reject: CB<E1 | E2>,
    private readonly resolve: CB<A2>,
    private readonly runtime: Runtime,
    private readonly cancellations: CancellationList,
    private readonly aFb: (e: A1) => FIO<R2, E2, A2>
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

class RunSource<R1, R2, E1, E2, A1, A2> implements IExecutable {
  public constructor(
    private readonly opt: Chain<R1, R2, E1, E2, A1, A2>,
    private readonly env: R1 & R2,
    private readonly rej: CB<E1 | E2>,
    private readonly res: CB<A2>,
    private readonly runtime: Runtime,
    private readonly cancellations: CancellationList
  ) {}

  public execute(): void {
    this.cancellations.push(
      this.opt.src.fork(
        this.env,
        this.rej,
        new ChainHandler<R1, R2, E1, E2, A1, A2>(
          this.env,
          this.rej,
          this.res,
          this.runtime,
          this.cancellations,
          this.opt.ab
        ).onResolve,
        this.runtime
      )
    )
  }
}

/**
 * @ignore
 */
export class Chain<R1, R2, E1, E2, A1, A2> extends FIO<R1 & R2, E1 | E2, A2> {
  public constructor(
    public readonly src: FIO<R1, E1, A1>,
    public readonly ab: (a: A1) => FIO<R2, E2, A2>
  ) {
    super()
  }

  public fork(
    env: R1 & R2,
    rej: CB<E1 | E2>,
    res: CB<A2>,
    runtime: Runtime
  ): ICancellable {
    const cancellations = new CancellationList()

    cancellations.push(
      runtime.scheduler.asap(
        new RunSource(this, env, rej, res, runtime, cancellations)
      )
    )

    return cancellations
  }
}
