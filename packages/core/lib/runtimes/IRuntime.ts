/**
 * Created by tushar on 2019-05-07
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CBExit} from '../internals/CBExit'
import {FiberConfig} from '../internals/FiberConfig'
import {QIO} from '../main/QIO'

/**
 * Base runtime that is used to execute any [[QIO]].
 *
 * Runtime internally manages scheduling of jobs and their prioritization.
 * Depends on [ts-scheduler](https://github.com/tusharmath/ts-scheduler) of internal job scheduling.
 * Actual implementation is available at [[DefaultRuntime]] & [[TestRuntime]].
 */
export interface IRuntime {
  readonly config: FiberConfig
  readonly scheduler: IScheduler
  configure(config: FiberConfig): IRuntime
  /**
   * Executes the provided [[QIO]] expression.
   * Returns a `ICancellable` that can be used to interrupt the execution.
   */
  unsafeExecute<A, E>(io: QIO<A, E>, cb?: CBExit<A, E>): ICancellable
}
