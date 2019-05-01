/**
 * Created by tushar on 2019-04-21
 */
import {TestScheduler} from 'ts-scheduler/test'

import {DefaultEnv} from '../../src/envs/DefaultEnv'

export interface TestEnv extends DefaultEnv {
  scheduler: TestScheduler
}
