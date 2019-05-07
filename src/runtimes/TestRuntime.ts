/**
 * Created by tushar on 2019-04-21
 */
import {testScheduler, TestScheduler} from 'ts-scheduler/test'

import {DefaultRuntime} from './DefaultRuntime'

/**
 * Extension of the [[DefaultRuntime]] that can be used for executing unit tests.
 */
export interface TestRuntime extends DefaultRuntime {
  scheduler: TestScheduler
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
 * import {testEnv} from 'fearless-io/test'
 *
 * let result: string = 'FOO'
 *
 * // Technically async code that should take 1000ms to complete
 * const io = FIO.timeout('BAR', 1000)
 * const env = testEnv()
 * io.fork(env, (i) => result = i)
 *
 * // Runs the async code synchronously
 * env.scheduler.run()
 *
 * assert.strictEqual(result, 10)
 * ```
 */
export const testRuntime = (): TestRuntime => ({
  scheduler: testScheduler()
})
