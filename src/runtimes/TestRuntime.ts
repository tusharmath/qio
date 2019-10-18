/**
 * Created by tushar on 2019-05-24
 */

import {Either, Option} from 'standard-data-structures'
import {ICancellable} from 'ts-scheduler'
import {ITestSchedulerOptions} from 'ts-scheduler/src/main/ITestSchedulerOptions'
import {TestScheduler, testScheduler} from 'ts-scheduler/test'

import {CBOption} from '../internals/CBOption'
import {Fiber} from '../internals/Fiber'
import {Id} from '../internals/Id'
import {FIO, IO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

type TestRuntimeOptions = Partial<
  ITestSchedulerOptions & {maxInstructionCount: number}
>
export class TestRuntime extends BaseRuntime {
  public readonly scheduler: TestScheduler
  public constructor(options: TestRuntimeOptions) {
    super(options.maxInstructionCount)
    this.scheduler = testScheduler(options)
  }

  public unsafeExecute<E, A>(io: FIO<E, A>, cb?: CBOption<E, A>): ICancellable {
    return Fiber.unsafeExecuteWith(io, this, cb)
  }

  public unsafeExecuteSync<E, A>(io: IO<E, A>): A | E | undefined {
    return this.unsafeExecuteSync0(io)
      .map(_ => _.reduce<A | E | undefined>(Id, Id))
      .getOrElse(undefined)
  }

  public unsafeExecuteSync0<E, A>(io: FIO<E, A>): Option<Either<E, A>> {
    let result: Option<Either<E, A>> = Option.none()
    this.unsafeExecute(io, _ => (result = _))
    this.scheduler.run()

    return result
  }
}

export const testRuntime = (O: TestRuntimeOptions = {}) => new TestRuntime(O)
