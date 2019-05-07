/**
 * Created by tushar on 2019-04-21
 */
import {testScheduler, TestScheduler} from 'ts-scheduler/test'

import {DefaultEnv} from './DefaultEnv'

/**
 * Extension of the [[DefaultEnv]] that can be used for writing unit tests.
 */
export interface TestEnv extends DefaultEnv {
  scheduler: TestScheduler
}

/**
 * Creates a new [[TestEnv]].
 *
 * Most IO related code is async and using the [[DefaultEnv]] one has to use callbacks and promises,
 * and then wait for random amounts of time for them to resolve.
 *
 * Using the [[TestEnv]] mitigates this problem by providing a different [scheduler]
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
export const testEnv = (): TestEnv => ({
  scheduler: testScheduler()
})
