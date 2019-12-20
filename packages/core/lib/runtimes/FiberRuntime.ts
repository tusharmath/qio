/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CBExit} from '../internals/CBExit'
import {Fiber} from '../internals/Fiber'
import {FiberConfig} from '../internals/FiberConfig'
import {QIO} from '../main/QIO'

import {IRuntime} from './IRuntime'

export abstract class FiberRuntime implements IRuntime {
  public abstract config: FiberConfig
  public abstract scheduler: IScheduler
  public abstract configure(config: FiberConfig): IRuntime
  public unsafeExecute<A, E>(io: QIO<A, E>, cb?: CBExit<A, E>): ICancellable {
    return Fiber.unsafeExecuteWith(io, this, cb)
  }
}
