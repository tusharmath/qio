/**
 * Created by tushar on 2019-03-20
 */

import {testScheduler} from 'ts-scheduler/test'

import {FIO} from '../../src/internals/FIO'

import {Timeline} from './Timeline'

export const IOCollector = <R>(env: R) => <A>(io: FIO<R, A>) => {
  /**
   * Create an internal TestScheduler
   */
  const scheduler = testScheduler()

  /**
   * Contains a list of all internal events.
   */
  const timeline = Timeline<A>(scheduler)

  /**
   * Forks the IO operation
   */
  const fork = () => io.fork(scheduler, env, timeline.reject, timeline.resolve)

  return {
    fork,
    scheduler,
    timeline
  }
}
