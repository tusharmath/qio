/**
 * Created by tushar on 2019-03-20
 */

import {FIO} from '../../src/main/FIO'
import {testRuntime, TestRuntimeOptions} from '../../src/runtimes/TestRuntime'

import {Timeline} from '../../src/internals/Timeline'

export const IOCollector = <A, E, R>(
  env: R,
  io: FIO<R, E, A>,
  opt?: TestRuntimeOptions
) => {
  /**
   * access the testScheduler
   */
  const runtime = testRuntime(opt)

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
