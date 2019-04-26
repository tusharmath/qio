/**
 * Created by tushar on 2019-04-24
 */

import {IO} from '../'
import {AnyEnv} from '../src/envs/AnyEnv'
import {SchedulerEnv} from '../src/envs/SchedulerEnv'

// $ExpectType IO<SchedulerEnv, never>
IO.from((env1, rej, res) => res(10))

// $ExpectType IO<SchedulerEnv, never>
IO.from((env: SchedulerEnv, rej, res) => env.scheduler.delay(() => res(10), 10))

// $ExpectType IO<SchedulerEnv, never>
IO.from<AnyEnv>((env, rej, res) => res(10))

// $ExpectType IO<SchedulerEnv, string>
IO.from<SchedulerEnv, string>((env, rej, res) => res(10))

// $ExpectType IO<SchedulerEnv, number>
IO.of(1000)
