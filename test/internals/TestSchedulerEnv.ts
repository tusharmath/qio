/**
 * Created by tushar on 2019-04-21
 */
import {TestScheduler} from 'ts-scheduler/src/TestScheduler'

import {SchedulerEnv} from '../../src/envs/SchedulerEnv'

export interface TestSchedulerEnv extends SchedulerEnv {
  scheduler: TestScheduler
}
