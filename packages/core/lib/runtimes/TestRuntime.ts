/**
 * Created by tushar on 2019-05-24
 */

import {Id} from '@qio/prelude'
import {TestScheduler, testScheduler} from 'ts-scheduler'

import {FiberConfig} from '../internals/FiberConfig'
import {Exit} from '../main/Exit'
import {QIO} from '../main/QIO'

import {FiberRuntime} from './FiberRuntime'

export class TestRuntime extends FiberRuntime {
  public constructor(
    public readonly scheduler: TestScheduler,
    public readonly config: FiberConfig
  ) {
    super()
  }
  public configure(config: FiberConfig): TestRuntime {
    return new TestRuntime(this.scheduler, config)
  }
  public unsafeExecuteSync<A, E>(io: QIO<A, E>): A | E | undefined {
    const exit = this.unsafeExecuteSync0(io)

    return exit !== undefined
      ? Exit.fold(exit)<A | E | undefined>(undefined, Id, Id)
      : undefined
  }
  public unsafeExecuteSync0<A, E>(io: QIO<A, E>): Exit<A, E> | undefined {
    let result: undefined | Exit<A, E>
    this.unsafeExecute(io, (_) => (result = _))
    this.scheduler.run()

    return result
  }
}

export const testRuntime = (scheduler: TestScheduler = testScheduler()) =>
  new TestRuntime(scheduler, FiberConfig.DEFAULT)
