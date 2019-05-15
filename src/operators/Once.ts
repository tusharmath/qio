import {LinkedList, LinkedListNode} from 'dbl-linked-list-ds'
import {ICancellable, IExecutable} from 'ts-scheduler'
import {CB} from '../internals/CB'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

class ResolveCached<R, E, A> implements IExecutable {
  public constructor(
    private readonly op: Once<R, E, A>,
    private readonly res: CB<A>
  ) {}

  public execute(): void {
    this.res(this.op.result as A)
  }
}

class RejectCached<R, E, A> implements IExecutable {
  public constructor(
    private readonly op: Once<R, E, A>,
    private readonly rej: CB<E>
  ) {}

  public execute(): void {
    this.rej(this.op.error as E)
  }
}

interface Callbacks<E, A> {
  rej: CB<E>
  res: CB<A>
}

class RemoveNode<R, E, A> implements ICancellable {
  public constructor(
    private readonly id: LinkedListNode<Callbacks<E, A>>,
    private readonly opt: Once<R, E, A>
  ) {}

  public cancel(): void {
    this.opt.Q.remove(this.id)
    if (this.opt.Q.length === 0 && typeof this.opt.cancel !== 'undefined') {
      this.opt.cancel.cancel()
    }
  }
}

/**
 * @ignore
 */
export class Once<R, E, A> extends FIO<R, E, A> {
  public cancel: ICancellable | undefined
  public error: E | undefined
  public readonly Q = new LinkedList<Callbacks<E, A>>()
  public result: A | undefined
  private isForked = false
  private isRejected = false
  private isResolved = false

  public constructor(private readonly io: FIO<R, E, A>) {
    super()
  }

  public fork(env: R, rej: CB<E>, res: CB<A>, runtime: Runtime): ICancellable {
    const sh = runtime.scheduler
    if (this.isResolved) {
      return sh.asap(new ResolveCached(this, res))
    }

    if (this.isRejected) {
      return sh.asap(new RejectCached(this, rej))
    }

    const id = this.Q.add({res, rej})

    if (!this.isForked) {
      this.isForked = true
      this.cancel = this.io.fork(env, this.onReject, this.onResolve, runtime)
    }

    return new RemoveNode(id, this)
  }

  private readonly onReject = (e: E) => {
    this.isRejected = true
    this.error = e
    this.Q.forEach(_ => _.value.rej(e))
  }

  private readonly onResolve = (a: A) => {
    this.result = a
    this.isResolved = true
    this.Q.forEach(_ => _.value.res(a))
  }
}
