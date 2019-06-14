/**
 * Created by tushar on 2019-05-24
 */

import {testScheduler} from 'ts-scheduler/test'

import {FIO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

export class TestRuntime extends BaseRuntime {
  public readonly scheduler = testScheduler()

  public executeSync<E, A>(io: FIO<E, A>): A | undefined {
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

export const testRuntime = () => new TestRuntime()
