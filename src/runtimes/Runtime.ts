/**
 * Created by tushar on 2019-05-07
 */
import {Cancel, IScheduler} from 'ts-scheduler'

import {NoEnv} from '../envs/NoEnv'
import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'

/**
 * Base runtime that is used to execute any [[FIO]].
 *
 * Runtime internally manages scheduling of jobs and their prioritization.
 * Depends on [ts-scheduler] of internal job scheduling.
 * [scheduler]: https://github.com/tusharmath/ts-scheduler
 * Actual implementation is available at [[DefaultRuntime]] & [[TestRuntime]].
 */
export interface Runtime {
  scheduler: IScheduler
  execute<E, A>(io: IFIO<NoEnv, E, A>, res: CB<A>, rej: CB<E>): Cancel
}
