/**
 * Created by tushar on 2019-04-18
 */

import {FIO} from '../../src/internals/FIO'

import {IOCollector} from './IOCollector'
import {TestSchedulerEnv} from './TestSchedulerEnv'

/**
 * Helpful wrapper over IOCollector
 * Forks the IO and runs everything in the queue.
 */
export const ForkNRun = <R, A>(env: R & TestSchedulerEnv, io: FIO<R, A>) => {
  const scheduler = env.scheduler
  const {fork, timeline} = IOCollector(env, io)
  fork()
  scheduler.run()

  return {timeline}
}
