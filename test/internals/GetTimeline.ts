/**
 * Created by tushar on 2019-04-21
 */
import {testScheduler} from 'ts-scheduler/test'

import {DefaultEnv} from '../../src/envs/DefaultEnv'
import {IFIO} from '../../src/internals/IFIO'

import {ForkNRun} from './ForkNRun'

export const GetTimeline = <A, E>(io: IFIO<DefaultEnv, E, A>) =>
  ForkNRun({scheduler: testScheduler()}, io).timeline
