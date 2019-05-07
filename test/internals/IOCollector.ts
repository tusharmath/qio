/**
 * Created by tushar on 2019-03-20
 */

import {IFIO} from '../../src/internals/IFIO'
import {testRuntime} from '../../src/runtimes/TestRuntime'

import {Timeline} from './Timeline'

export const IOCollector = <A, E, R>(env: R, io: IFIO<R, E, A>) => {
  /**
   * access the testScheduler
   */
  const runtime = testRuntime()

  /**
   * Contains a list of all internal events.
   */
  const timeline = Timeline<E, A>(runtime)

  /**
   * Forks the IO operation
   */
  const fork = () => io.fork(env, timeline.reject, timeline.resolve, runtime)

  return {
    fork,
    runtime,
    timeline
  }
}
