/**
 * Created by tushar on 2019-05-07
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {IO} from '../main/FIO'

/**
 * Base runtime that is used to execute any [[FIO]].
 *
 * Runtime internally manages scheduling of jobs and their prioritization.
 * Depends on [ts-scheduler] of internal job scheduling.
 * [scheduler]: https://github.com/tusharmath/ts-scheduler
 * Actual implementation is available at [[DefaultRuntime]] & [[TestRuntime]].
 */
export interface IRuntime {
  scheduler: IScheduler
  execute<E, A>(io: IO<E, A>, res?: CB<A>, rej?: CB<E>): ICancellable
}
