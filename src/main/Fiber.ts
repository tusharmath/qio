import {ICancellable} from 'ts-scheduler'

import {FIO, UIO} from '../main/FIO'

import {Exit} from './Exit'

/**
 * Fibers are data structures that provide you a handle to control the execution of its `IO`.
 * They can be created by calling the [[FIO.fork]] method.
 * Fiber created is always going to be in a `Paused` state. To resume the fiber, you should call the `resume` or the `resumeAsync` methods.
 * @typeparam E Exceptions that can be thrown
 * @typeparam A The success value
 */
export abstract class Fiber<E, A> implements ICancellable {
  public abstract abort: UIO<void>
  public abstract resume: FIO<E, A>
  /**
   * @ignore
   */
  public abstract $abort(): void
  /**
   * @ignore
   */
  public cancel(): void {
    this.$abort()
  }
  public abstract resumeAsync(cb: (exit: Exit<E, A>) => UIO<void>): UIO<void>
}
