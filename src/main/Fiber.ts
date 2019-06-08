import {ICancellable} from 'ts-scheduler'

import {IO, UIO} from '../main/FIO'

import {Exit} from './Exit'

export abstract class Fiber<E, A> implements ICancellable {
  public abstract abort: UIO<void>
  public abstract resume: IO<E, A>
  public abstract $abort(): void
  public cancel(): void {
    this.$abort()
  }
  public abstract resumeAsync(
    cb: (exit: Exit<E, A>) => UIO<void>
  ): UIO<Fiber<E, A>>
}
