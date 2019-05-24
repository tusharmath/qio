/**
 * Created by tushar on 2019-05-24
 */

import {ICancellable} from 'ts-scheduler'
import {testScheduler} from 'ts-scheduler/test'
import {interpret} from '../internals/Interpret'
import {noop} from '../internals/Noop'
import {FIO} from '../main/FIO'
import {IRuntime} from './IRuntime'

class TestRuntime<R> implements IRuntime<R> {
  public readonly scheduler = testScheduler()
  public constructor(private readonly env: R) {}

  public execute<E, A>(
    io: FIO<R, E, A>,
    res: (e: A) => void = noop,
    rej: (e: E) => void = noop
  ): ICancellable {
    return this.scheduler.asap(
      interpret,
      io,
      [],
      this.env,
      rej,
      res,
      this.scheduler
    )
  }

  public executeSync<E, A>(io: FIO<R, E, A>): A | undefined {
    let result: A | undefined
    this.execute(
      io,
      (a: A) => {
        result = a
      },
      (err: E) => {
        throw err
      }
    )
    this.scheduler.run()

    return result
  }
}

export const testRuntime = <R>(env: R) => new TestRuntime(env)
