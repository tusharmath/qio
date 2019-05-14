/**
 * Created by tushar on 2019-04-21
 */
import {NoEnv} from '../../src/envs/NoEnv'
import {FIO} from '../../src/main/FIO'

import {ForkNRun} from './ForkNRun'

export const GetTimeline = <A, E>(io: FIO<NoEnv, E, A>) =>
  ForkNRun(undefined, io).timeline
