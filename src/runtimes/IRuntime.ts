/**
 * Created by tushar on 2019-05-07
 */
import {IScheduler} from 'ts-scheduler'

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
}
