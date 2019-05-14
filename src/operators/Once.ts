import {LinkedList} from 'dbl-linked-list-ds'
import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

/**
 * @ignore
 */
export class Once<R, E, A> extends FIO<R, E, A> {
  private cancel: Cancel | undefined
  private error: E | undefined
  private isForked = false
  private isRejected = false
  private isResolved = false
  private readonly Q = new LinkedList<{rej: CB<E>; res: CB<A>}>()
  private result: A | undefined

  public constructor(private readonly io: FIO<R, E, A>) {
    super()
  }

  public fork(env: R, rej: CB<E>, res: CB<A>, runtime: Runtime): Cancel {
    const sh = runtime.scheduler
    if (this.isResolved) {
      return sh.asap(() => res(this.result as A))
    }

    if (this.isRejected) {
      return sh.asap(() => rej(this.error as E))
    }

    const id = this.Q.add({res, rej})

    if (!this.isForked) {
      this.isForked = true
      this.cancel = this.io.fork(env, this.onReject, this.onResolve, runtime)
    }

    return () => {
      this.Q.remove(id)
      if (this.Q.length === 0 && typeof this.cancel === 'function') {
        this.cancel()
      }
    }
  }

  private readonly onReject = (err: E) => {
    this.isRejected = true
    this.error = err
    this.Q.forEach(_ => _.value.rej(err))
  }

  private readonly onResolve = (a: A) => {
    this.result = a
    this.isResolved = true
    this.Q.forEach(_ => _.value.res(a))
  }
}
