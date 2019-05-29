/**
 * Created by tushar on 2019-05-24
 */

import {testScheduler} from 'ts-scheduler/test'

import {FIO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

class TestRuntime<R> extends BaseRuntime<R> {
  public readonly scheduler = testScheduler()

  public constructor(env: R) {
    super(env)
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
