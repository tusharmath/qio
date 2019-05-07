/**
 * Created by tushar on 2019-04-21
 */
import {testScheduler} from 'ts-scheduler/test'

import {Runtime} from './Runtime'

/**
 * Extension of the [[DefaultRuntime]] that can be used for executing unit tests.
 */

export class TestRuntime extends Runtime {
  public readonly scheduler = testScheduler()
}

/**
 * Creates a new [[TestRuntime]].
 *
 * Most IO related code is async and using the [[DefaultRuntime]] one has to use callbacks and promises,
 * and then wait for random amounts of time for them to resolve.
 *
 * Using the [[TestRuntime]] mitigates this problem by providing a different [scheduler]
 * which runs jobs synchronously.
 *
 *
 * [scheduler]: https://github.com/tusharmath/ts-scheduler
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
 * assert.strictEqual(result, 10)
 * ```
 */
export const testRuntime = () => new TestRuntime()
