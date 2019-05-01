/**
 * Created by tushar on 2019-04-18
 */

import {IFIO} from '../../src/internals/IFIO'

import {IOCollector} from './IOCollector'
import {TestEnv} from './TestEnv'

/**
 * Helpful wrapper over IOCollector
 * Forks the IO and runs everything in the queue.
 */
export const ForkNRun = <R, E, A>(env: R & TestEnv, io: IFIO<R, E, A>) => {
  const scheduler = env.scheduler
  const {fork, timeline} = IOCollector(env, io)
  fork()
  scheduler.run()

  return {timeline}
}
