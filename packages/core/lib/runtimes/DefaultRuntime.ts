import {scheduler} from 'ts-scheduler'

import {Fiber} from '../internals/Fiber'
import {FiberConfig} from '../internals/FiberYieldStrategy'
import {QIO} from '../main/QIO'

import {FiberRuntime} from './FiberRuntime'

export class DefaultRuntime extends FiberRuntime {
  public readonly scheduler = scheduler

  public constructor(public readonly config: FiberConfig) {
    super()
  }

  // tslint:disable-next-line: prefer-function-over-method
  public configure(config: FiberConfig): DefaultRuntime {
    return new DefaultRuntime(config)
  }

  public async unsafeExecutePromise<A, E>(io: QIO<A, E>): Promise<A> {
    return new Promise((res, rej) => {
      this.unsafeExecute(io, O => O.map(_ => _.reduce(rej, res)))
    })
  }
}

export const defaultRuntime = () => new DefaultRuntime(Fiber.DEFAULT)
