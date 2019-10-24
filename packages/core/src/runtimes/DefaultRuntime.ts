import {scheduler} from 'ts-scheduler'

import {QIO} from '../main/QIO'

import {BaseRuntime} from './BaseRuntime'

interface IDefaultRuntimeOptions {
  maxInstructionCount: number
}
export class DefaultRuntime extends BaseRuntime {
  public scheduler = scheduler
  public constructor(maxInstructionCount?: number) {
    super(maxInstructionCount)
  }

  // tslint:disable-next-line: prefer-function-over-method
  public setMaxInstructionCount(maxInstructionCount: number): DefaultRuntime {
    return new DefaultRuntime(maxInstructionCount)
  }

  public async unsafeExecutePromise<E, A>(io: QIO<E, A>): Promise<A> {
    return new Promise((res, rej) => {
      this.unsafeExecute(io, O => O.map(_ => _.reduce(rej, res)))
    })
  }
}

export const defaultRuntime = (O: Partial<IDefaultRuntimeOptions> = {}) =>
  new DefaultRuntime(O.maxInstructionCount)
