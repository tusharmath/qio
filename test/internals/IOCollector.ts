/**
 * Created by tushar on 2019-03-20
 */

import {SchedulerEnv} from '../../src/envs/SchedulerEnv'
import {FIO} from '../../src/internals/FIO'

import {Timeline} from './Timeline'

export const IOCollector = <A, R>(env: R & SchedulerEnv, io: FIO<R, A>) => {
  /**
   * access the testScheduler
   */
  const scheduler = env.scheduler

  /**
   * Contains a list of all internal events.
   */
  const timeline = Timeline<A>(scheduler)

  /**
   * Forks the IO operation
   */
  const fork = () => io.fork(env, timeline.reject, timeline.resolve)

  return {
    fork,
    timeline
  }
}
