/**
 * Created by tushar on 2019-05-25
 */
import {IScheduler} from 'ts-scheduler'

import {IRuntime} from './IRuntime'

export abstract class BaseRuntime implements IRuntime {
  public abstract readonly scheduler: IScheduler
  public constructor(
    public readonly maxInstructionCount: number = Number.MAX_SAFE_INTEGER
  ) {}
}
