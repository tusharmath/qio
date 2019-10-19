/**
 * Created by tushar on 2019-05-07
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CBOption} from '../internals/CBOption'
import {FIO} from '../main/FIO'

/**
 * Base runtime that is used to execute any [[FIO]].
 *
 * Runtime internally manages scheduling of jobs and their prioritization.
 * Depends on [ts-scheduler](https://github.com/tusharmath/ts-scheduler) of internal job scheduling.
 * Actual implementation is available at [[DefaultRuntime]] & [[TestRuntime]].
 */
export interface IRuntime {
  maxInstructionCount: number
  scheduler: IScheduler
  setMaxInstructionCount(maxInstructionCount: number): IRuntime

  /**
   * Executes the provided [[FIO]] expression.
   * Returns a [[ICancellable]] that can be used to interrupt the execution.
   */
  unsafeExecute<E, A>(io: FIO<E, A>, cb?: CBOption<E, A>): ICancellable
}
