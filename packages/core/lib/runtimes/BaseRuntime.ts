/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CBOption} from '../internals/CBOption'
import {Fiber} from '../internals/Fiber'
import {QIO} from '../main/QIO'

import {IRuntime} from './IRuntime'

export abstract class BaseRuntime implements IRuntime {
  public readonly maxInstructionCount: number
  public abstract readonly scheduler: IScheduler
  public constructor(maxInstructionCount: number = Number.MAX_SAFE_INTEGER) {
    this.maxInstructionCount = Math.min(
      Math.max(1, maxInstructionCount),
      Number.MAX_SAFE_INTEGER
    )
  }
  public abstract setMaxInstructionCount(maxInstructionCount: number): IRuntime
  public unsafeExecute<E, A>(io: QIO<E, A>, cb?: CBOption<E, A>): ICancellable {
    return Fiber.unsafeExecuteWith(io, this, cb)
  }
}
