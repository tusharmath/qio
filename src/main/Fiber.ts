import {ICancellable} from 'ts-scheduler'

import {IO, UIO} from '../main/FIO'

export abstract class Fiber<E, A> implements ICancellable {
  public abstract $abort(): void
  public abstract abort(): UIO<void>
  public cancel(): void {
    this.$abort()
  }
  public abstract resume(): IO<E, A>
}
