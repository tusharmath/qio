/**
 * Created by tushar on 2019-04-24
 */

import {IO} from '../src/main/IO'

// $ExpectType IO<SchedulerEnv, number>
IO.reject(new Error('!!!')).catch(() => IO.of(10))

// $ExpectType IO<SchedulerEnv, string | number>
IO.of('OLA').catch(() => IO.of(10))

// $ExpectType IO<SchedulerEnv, number>
IO.never().catch(() => IO.of(10))
