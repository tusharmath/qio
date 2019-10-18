import {scheduler} from 'ts-scheduler'

import {Fiber} from '../internals/Fiber'
import {FIO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

interface IDefaultRuntimeOptions {
  maxInstructionCount: number
}
export class DefaultRuntime extends BaseRuntime {
  public scheduler = scheduler
  public constructor(maxInstructionCount?: number) {
    super(maxInstructionCount)
  }

  public async unsafeExecutePromise<E, A>(io: FIO<E, A>): Promise<A> {
    return new Promise((res, rej) => {
      Fiber.unsafeExecuteWith(io, this, O => O.map(_ => _.reduce(rej, res)))
    })
  }
}

export const defaultRuntime = (O: Partial<IDefaultRuntimeOptions> = {}) =>
  new DefaultRuntime(O.maxInstructionCount)
