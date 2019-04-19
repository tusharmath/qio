/**
 * Created by tushar on 2019-04-18
 */

/**
 * The default env in which the IO can run.
 */
import {IScheduler, scheduler} from 'ts-scheduler'

export interface SchedulerEnv {
  scheduler: IScheduler
}

/**
 * @ignore
 */
export const defaultEnv: SchedulerEnv = {
  scheduler
}
