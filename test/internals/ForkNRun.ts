/**
 * Created by tushar on 2019-04-18
 */

import {FIO} from '../../src/internals/FIO'

import {IOCollector} from './IOCollector'

/**
 * Helpful wrapper over IOCollector
 * Forks the IO and runs everything in the queue.
 */
export const ForkNRun = <A>(io: FIO<A>) => {
  const {fork, timeline, scheduler} = IOCollector(io)
  fork()
  scheduler.run()

  return {timeline}
}
