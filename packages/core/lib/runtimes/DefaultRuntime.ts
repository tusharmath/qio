import {IScheduler, scheduler as dScheduler} from 'ts-scheduler'

import {FiberConfig} from '../internals/FiberConfig'
import {Exit} from '../main/Exit'
import {QIO} from '../main/QIO'

import {FiberRuntime} from './FiberRuntime'

export class DefaultRuntime extends FiberRuntime {
  public constructor(
    public readonly scheduler: IScheduler,
    public readonly config: FiberConfig
  ) {
    super()
  }

  public configure(config: FiberConfig): DefaultRuntime {
    return new DefaultRuntime(this.scheduler, config)
  }

  public async unsafeExecutePromise<A, E>(io: QIO<A, E>): Promise<A> {
    return new Promise((res, rej) => {
      this.unsafeExecute(io, (exit) => Exit.fold(exit)(undefined, res, rej))
    })
  }
}

export const defaultRuntime = () =>
  new DefaultRuntime(dScheduler, FiberConfig.DEFAULT)
