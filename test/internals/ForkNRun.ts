/**
 * Created by tushar on 2019-04-18
 */

import {FIO} from '../../src/internals/FIO'

import {IOCollector} from './IOCollector'

/**
 * Helpful wrapper over IOCollector
 * Forks the IO and runs everything in the queue.
 */
export const ForkNRun = <R, A>(env: R, io: FIO<R, A>) => {
  const {fork, timeline, scheduler} = IOCollector(env, io)
  fork()
  scheduler.run()

  return {timeline}
}
