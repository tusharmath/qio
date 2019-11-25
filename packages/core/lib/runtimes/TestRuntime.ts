/**
 * Created by tushar on 2019-05-24
 */

import {Id} from '@qio/prelude/Id'
import {Either, Option} from 'standard-data-structures'
import {SchedulerOptions, TestScheduler, testScheduler} from 'ts-scheduler'

import {QIO} from '../main/QIO'

import {BaseRuntime} from './BaseRuntime'
type TestRuntimeOptions = SchedulerOptions & {
  maxInstructionCount?: number
}
export class TestRuntime extends BaseRuntime {
  public readonly scheduler: TestScheduler
  public constructor(private readonly options: TestRuntimeOptions) {
    super(options.maxInstructionCount)
    this.scheduler = testScheduler(options)
  }
  public setMaxInstructionCount(maxInstructionCount: number): TestRuntime {
    return new TestRuntime({...this.options, maxInstructionCount})
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

export const testRuntime = (O: TestRuntimeOptions = {}) => new TestRuntime(O)
