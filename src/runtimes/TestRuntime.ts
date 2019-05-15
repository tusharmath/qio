/**
 * Created by tushar on 2019-04-21
 */
import {ICancellable} from 'ts-scheduler'
import {testScheduler} from 'ts-scheduler/test'

import {Timeline} from '../../test/internals/Timeline'
import {NoEnv} from '../envs/NoEnv'
import {FIO} from '../main/FIO'

import {Runtime} from './Runtime'

/**
 * Runtime options for the test env
 */
export interface TestRuntimeOptions {
  /**
   * Amount of time after with the test should bailout
   */
  bailout?: number
}

/**
 * Extension of the [[Runtime]] that can be used for executing unit tests.
 */

export class TestRuntime implements Runtime {
  public readonly scheduler = testScheduler(this.options)
  public readonly timeline = Timeline(this)
  public constructor(private readonly options: TestRuntimeOptions) {}
  public execute<E, A>(io: FIO<NoEnv, E, A>): ICancellable {
    return io.fork(undefined, this.timeline.reject, this.timeline.resolve, this)
  }
}
/**
 * Creates a new [[TestRuntime]].
 *
 * [[DefaultRuntime]] uses actual CPU clock to schedule jobs.
 * So For instance if you want to write a program that waits for 1second and then completes,
 * using the CPU clock the [[DefaultRuntime]] will ensure that the program actually waits for 1sec.
 * At the same time your code will now be executed asynchronously.
 *
 * This wait can be completely removed if you use the [[TestRuntime]].
 * It injects a virtual sense of time into [[FIO]] and runs code synchronously.
 *
 * ```ts
 * import {FIO} from 'fearless-io'
 * import {testRuntime} from 'fearless-io/test'
 *
 * let result: string = 'FOO'
 *
 * // Technically async code that should take 1000ms to complete
 * const io = FIO.timeout('BAR', 1000)
 *
 * // Create a new runtime
 * const runtime = testRuntime()
 *
 * // Execute the IO
 * runtime.execute(io, i => result = i)
 *
 * assert.strictEqual(result, 'BAR')
 * ```
 */

export const testRuntime = (options: TestRuntimeOptions = {}) =>
  new TestRuntime(options)
