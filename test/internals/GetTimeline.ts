/**
 * Created by tushar on 2019-04-21
 */
import {NoEnv} from '../../src/envs/NoEnv'
import {IFIO} from '../../src/internals/IFIO'

import {ForkNRun} from './ForkNRun'

export const GetTimeline = <A, E>(io: IFIO<NoEnv, E, A>) =>
  ForkNRun(undefined, io).timeline
