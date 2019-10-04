/**
 * Created by tushar on 2019-05-24
 */

import {Either} from 'standard-data-structures'
import {ITestSchedulerOptions} from 'ts-scheduler/src/main/ITestSchedulerOptions'
import {TestScheduler, testScheduler} from 'ts-scheduler/test'

import {Id} from '../internals/Id'
import {FIO, IO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

export class TestRuntime extends BaseRuntime {
  public readonly scheduler: TestScheduler
  public constructor(options?: Partial<ITestSchedulerOptions>) {
    super()
    this.scheduler = testScheduler(options)
  }

  public exit<E, A>(io: FIO<E, A>): Either<E, A> {
    let result: Either<E, A> = Either.neither()
    this.unsafeExecute(
      io,
      _ => (result = Either.right(_)),
      _ => (result = Either.left(_))
    )
    this.scheduler.run()

    return result
  }

  public unsafeExecuteSync<E, A>(io: IO<E, A>): A | E | undefined {
    const result = this.exit(io)
    this.scheduler.run()

    return result.fold<E | A | undefined>(undefined, Id, Id)
  }
}

export const testRuntime = (O?: Partial<ITestSchedulerOptions>) =>
  new TestRuntime(O)
