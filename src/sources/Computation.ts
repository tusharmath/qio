import {ICancellable, IExecutable} from 'ts-scheduler'

import {CancellationList} from '../cancellables/CancellationList'
import {CB} from '../internals/CB'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

const FORKED: IOStatus = 0
const RESOLVED: IOStatus = 1
const REJECTED: IOStatus = 2
const CANCELLED: IOStatus = 3

type IOStatus = -1 | 0 | 1 | 2 | 3

class CancelCB implements ICancellable {
  public constructor(private readonly cb: () => void) {}
  public cancel(): void {
    this.cb()
  }
}
class Executor<R, E, A> implements IExecutable, ICancellable {
  private status: IOStatus = FORKED
  public constructor(
    private readonly opt: Computation<R, E, A>,
    private readonly env: R,
    private readonly rej: CB<E>,
    private readonly res: CB<A>,
    private readonly runtime: Runtime,
    private readonly cancellations: CancellationList
  ) {}

  public cancel(): void {
    if (this.status === FORKED) {
      this.status = CANCELLED
      this.cancellations.cancel()
    }
  }

  public execute(): void {
    try {
      const cancel = this.opt.cmp(
        this.env,
        this.onRej,
        this.onRes,
        this.runtime
      )
      if (typeof cancel === 'function') {
        this.cancellations.push(new CancelCB(cancel))
      }
    } catch (e) {
      this.rej(e as E)
    }
  }
  public onRej = (e: E) => {
    this.status = REJECTED
    this.rej(e)
  }
  public onRes = (a: A) => {
    this.status = RESOLVED
    this.res(a)
  }
}

/**
 * @ignore
 */
export class Computation<R, E, A> extends FIO<R, E, A> {
  public constructor(
    public readonly cmp: (
      env: R,
      rej: CB<E>,
      res: CB<A>,
      runtime: Runtime
    ) => void | (() => void)
  ) {
    super()
  }

  public fork(env: R, rej: CB<E>, res: CB<A>, runtime: Runtime): ICancellable {
    const cancellable = new CancellationList()
    const executor = new Executor(this, env, rej, res, runtime, cancellable)
    cancellable.push(runtime.scheduler.asap(executor))

    return executor
  }
}
