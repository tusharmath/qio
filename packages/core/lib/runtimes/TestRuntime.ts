/**
 * Created by tushar on 2019-05-24
 */

import {Id} from '@qio/prelude'
import {Either, Option} from 'standard-data-structures'
import {SchedulerOptions, TestScheduler, testScheduler} from 'ts-scheduler'

import {Fiber} from '../internals/Fiber'
import {FiberConfig} from '../internals/FiberYieldStrategy'
import {QIO} from '../main/QIO'

import {BaseRuntime} from './BaseRuntime'

export class TestRuntime extends BaseRuntime {
  public readonly scheduler: TestScheduler
  public constructor(
    private readonly options: SchedulerOptions,
    public readonly config: FiberConfig
  ) {
    super()
    this.scheduler = testScheduler(options)
  }
  public configure(yieldInfo: FiberConfig): TestRuntime {
    return new TestRuntime(this.options, yieldInfo)
  }
  public unsafeExecuteSync<A, E>(io: QIO<A, E>): A | E | undefined {
    return this.unsafeExecuteSync0(io)
      .map(_ => _.reduce<A | E | undefined>(Id, Id))
      .getOrElse(undefined)
  }
  public unsafeExecuteSync0<A, E>(io: QIO<A, E>): Option<Either<E, A>> {
    let result: Option<Either<E, A>> = Option.none()
    this.unsafeExecute(io, _ => (result = _))
    this.scheduler.run()

    return result
  }
}

export const testRuntime = (O: SchedulerOptions = {}) =>
  new TestRuntime(O, Fiber.DEFAULT)
