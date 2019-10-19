/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CBOption} from '../internals/CBOption'
import {Fiber} from '../internals/Fiber'
import {FIO} from '../main/FIO'

import {IRuntime} from './IRuntime'

export abstract class BaseRuntime implements IRuntime {
  public abstract readonly scheduler: IScheduler
  public constructor(
    public readonly maxInstructionCount: number = Number.MAX_SAFE_INTEGER
  ) {}

  public unsafeExecute<E, A>(io: FIO<E, A>, cb?: CBOption<E, A>): ICancellable {
    return Fiber.unsafeExecuteWith(io, this, cb)
  }
}
