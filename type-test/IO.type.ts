/**
 * Created by tushar on 2019-04-24
 */

import {IO} from '../'
import {SchedulerEnv} from '../src/envs/SchedulerEnv'

// $ExpectType IO<SchedulerEnv, never, never>
IO.from((env1, rej, res) => res(10))

// $ExpectType IO<SchedulerEnv, never, never>
IO.from((env: SchedulerEnv, rej, res) => env.scheduler.delay(() => res(10), 10))

// $ExpectType IO<SchedulerEnv, never, never>
IO.from((env, rej, res) => res(10))

// $ExpectType IO<SchedulerEnv, never, string>
IO.from<SchedulerEnv, never, string>((env, rej, res) => res(10))

// $ExpectType IO<SchedulerEnv, never, number>
IO.of(1000)

// $ExpectType IO<SchedulerEnv, number, never>
IO.reject(1000)

// $ExpectType IO<SchedulerEnv, never, number>
IO.reject(1000).catch(() => IO.of(10))
