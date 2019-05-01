/**
 * Created by tushar on 2019-04-21
 */
import {testScheduler} from 'ts-scheduler/test'

import {DefaultEnv} from '../../src/envs/DefaultEnv'
import {FIO} from '../../src/internals/FIO'

import {ForkNRun} from './ForkNRun'

export const GetTimeline = <A, E>(io: FIO<DefaultEnv, E, A>) =>
  ForkNRun({scheduler: testScheduler()}, io).timeline
