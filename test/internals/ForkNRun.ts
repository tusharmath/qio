/**
 * Created by tushar on 2019-04-18
 */

import {IFIO} from '../../src/internals/IFIO'
import {TestRuntime} from '../../src/runtimes/TestRuntime'

import {IOCollector} from './IOCollector'

/**
 * Helpful wrapper over IOCollector
 * Forks the IO and runs everything in the queue.
 */
export const ForkNRun = <R, E, A>(env: R, io: IFIO<R, E, A>) => {
  const {fork, timeline, runtime} = IOCollector(env, io)
  fork()
  runtime.scheduler.run()

  return {timeline, runtime}
}
