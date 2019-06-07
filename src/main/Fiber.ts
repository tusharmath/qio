import {ICancellable} from 'ts-scheduler'

import {IO, UIO} from '../main/FIO'

import {Exit} from './Exit'

export abstract class Fiber<E, A> implements ICancellable {
  public abstract $abort(): void
  public abstract abort(): UIO<void>
  public cancel(): void {
    this.$abort()
  }
  public abstract resume(): IO<E, A>
  public abstract resumeAsync(
    cb: (exit: Exit<E, A>) => UIO<void>
  ): UIO<Fiber<E, A>>
}
