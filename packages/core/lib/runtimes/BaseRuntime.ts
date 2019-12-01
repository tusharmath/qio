/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CBOption} from '../internals/CBOption'
import {Fiber} from '../internals/Fiber'
import {FiberConfig} from '../internals/FiberYieldStrategy'
import {QIO} from '../main/QIO'

import {IRuntime} from './IRuntime'

// TODO: rename to FiberRuntime
export abstract class BaseRuntime implements IRuntime {
  public abstract config: FiberConfig
  public abstract scheduler: IScheduler
  public abstract configure(config: FiberConfig): IRuntime
  public unsafeExecute<A, E>(io: QIO<A, E>, cb?: CBOption<A, E>): ICancellable {
    return Fiber.unsafeExecuteWith(io, this, cb)
  }
}
