import {scheduler} from 'ts-scheduler'

import {BaseRuntime} from './BaseRuntime'

interface IDefaultRuntimeOptions {
  maxInstructionCount: number
}
export class DefaultRuntime extends BaseRuntime {
  public scheduler = scheduler
  public constructor(maxInstructionCount?: number) {
    super(maxInstructionCount)
  }
}

export const defaultRuntime = (O: Partial<IDefaultRuntimeOptions> = {}) =>
  new DefaultRuntime(O.maxInstructionCount)
