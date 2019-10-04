/**
 * Created by tushar on 2019-05-07
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {FIO} from '../main/FIO'

/**
 * Base runtime that is used to execute any [[FIO]].
 *
 * Runtime internally manages scheduling of jobs and their prioritization.
 * Depends on [ts-scheduler](https://github.com/tusharmath/ts-scheduler) of internal job scheduling.
 * Actual implementation is available at [[DefaultRuntime]] & [[TestRuntime]].
 */
export interface IRuntime {
  scheduler: IScheduler

  /**
   * Executes the provided [[FIO]] expression.
   * Returns a [[ICancellable]] that can be used to interrupt the execution.
   */
  unsafeExecute<E, A>(io: FIO<E, A>, res?: CB<A>, rej?: CB<E>): ICancellable
}

/**
 * Env needed to get access to the current [[IRuntime]].
 */
export interface IRuntimeEnv {
  runtime: IRuntime
}
