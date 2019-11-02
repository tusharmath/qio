/**
 * Created by tushar on 2019-05-24
 */

import {Id} from '@qio/prelude/Id'
import {Either, Option} from 'standard-data-structures'
import {ITestSchedulerOptions} from 'ts-scheduler/src/main/ITestSchedulerOptions'
import {TestScheduler, testScheduler} from 'ts-scheduler/test'

import {QIO} from '../main/QIO'

import {BaseRuntime} from './BaseRuntime'

type TestRuntimeOptions = Partial<
  ITestSchedulerOptions & {maxInstructionCount: number}
>
export class TestRuntime extends BaseRuntime {
  public readonly scheduler: TestScheduler
  public constructor(private readonly options: TestRuntimeOptions) {
    super(options.maxInstructionCount)
    this.scheduler = testScheduler(options)
  }
  public setMaxInstructionCount(maxInstructionCount: number): TestRuntime {
    return new TestRuntime({...this.options, maxInstructionCount})
  }
  public unsafeExecuteSync<E, A>(io: QIO<E, A>): A | E | undefined {
    return this.unsafeExecuteSync0(io)
      .map(_ => _.reduce<A | E | undefined>(Id, Id))
      .getOrElse(undefined)
  }
  public unsafeExecuteSync0<E, A>(io: QIO<E, A>): Option<Either<E, A>> {
    let result: Option<Either<E, A>> = Option.none()
    this.unsafeExecute(io, _ => (result = _))
    this.scheduler.run()

    return result
  }
}

export const testRuntime = (O: TestRuntimeOptions = {}) => new TestRuntime(O)
