/**
 * Created by tushar on 2019-05-24
 */

import {Either} from 'standard-data-structures'
import {testScheduler} from 'ts-scheduler/test'

import {Id} from '../internals/Id'
import {FIO, IO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

export class TestRuntime extends BaseRuntime {
  public readonly scheduler = testScheduler()

  public executeSync<E, A>(io: IO<E, A>): A | E | undefined {
    const result = this.exit(io)
    this.scheduler.run()

    return result.fold<E | A | undefined>(undefined, Id, Id)
  }

  public exit<E, A>(io: FIO<E, A>): Either<E, A> {
    let result: Either<E, A> = Either.neither()
    this.execute(
      io,
      _ => (result = Either.right(_)),
      _ => (result = Either.left(_))
    )
    this.scheduler.run()

    return result
  }
}

export const testRuntime = () => new TestRuntime()
