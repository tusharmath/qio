/**
 * Created by tushar on 2019-04-24
 */

import {IO} from '../src/main/IO'

// $ExpectType IO<SchedulerEnv, never, never>
IO.never().zip(IO.of(10))

// $ExpectType IO<SchedulerEnv, never, never>
IO.never().zip(IO.never())

// $ExpectType IO<SchedulerEnv, never, [number, Date]>
IO.of(1000).zip(IO.of(new Date()))

// $ExpectType IO<SchedulerEnv, never, [number, Date]>
IO.of(1000).zip(IO.of(new Date()))
