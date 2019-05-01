/**
 * Created by tushar on 2019-04-24
 */

import {IO} from '../src/main/IO'

// $ExpectType IO<SchedulerEnv, never, never>
IO.never().race(IO.never())

// $ExpectType IO<SchedulerEnv, never, number>
IO.never().race(IO.of(10))

// $ExpectType IO<SchedulerEnv, never, number>
IO.never().race(IO.of(10))

// $ExpectType IO<SchedulerEnv, never, number | Date>
IO.of(1000).race(IO.of(new Date()))

// $ExpectType IO<SchedulerEnv, number, never>
IO.never().race(IO.reject(10))
