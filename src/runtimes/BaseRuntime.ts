/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CBOption} from '../internals/CBOption'
import {FiberContext} from '../internals/Fiber'
import {FIO} from '../main/FIO'

import {IRuntime} from './IRuntime'

export abstract class BaseRuntime implements IRuntime {
  public abstract readonly scheduler: IScheduler

  public unsafeExecute<E, A>(io: FIO<E, A>, cb?: CBOption<E, A>): ICancellable {
    const context = FiberContext.evaluateWith(io, this.scheduler)
    if (cb !== undefined) {
      context.unsafeObserve(cb)
    }

    return context
  }
}
