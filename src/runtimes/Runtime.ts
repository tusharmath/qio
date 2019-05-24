/**
 * Created by tushar on 2019-05-07
 */
import {ICancellable, IScheduler} from 'ts-scheduler'
import {CB} from '../internals/CB'
import {FIO2} from '../main/FIO2'

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
  execute<E, A>(
    io: FIO2<unknown, E, A>,
    res: CB<A>,
    rej: CB<E | Error>
  ): ICancellable
}
