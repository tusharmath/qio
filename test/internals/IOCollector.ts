/**
 * Created by tushar on 2019-03-20
 */

import {DefaultEnv} from '../../src/envs/DefaultEnv'
import {FIO} from '../../src/internals/FIO'

import {Timeline} from './Timeline'

export const IOCollector = <A, E, R>(env: R & DefaultEnv, io: FIO<R, E, A>) => {
  /**
   * access the testScheduler
   */
  const scheduler = env.scheduler

  /**
   * Contains a list of all internal events.
   */
  const timeline = Timeline<E, A>(scheduler)

  /**
   * Forks the IO operation
   */
  const fork = () => io.fork(env, timeline.reject, timeline.resolve)

  return {
    fork,
    timeline
  }
}
