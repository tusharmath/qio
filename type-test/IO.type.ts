/**
 * Created by tushar on 2019-04-24
 */

import {IO} from '../'
import {DefaultEnv} from '../src/envs/DefaultEnv'

// $ExpectType IO<DefaultEnv, never, never>
IO.from((env1, rej, res) => res(10))

// $ExpectType IO<DefaultEnv, never, never>
IO.from((env: DefaultEnv, rej, res) => env.scheduler.delay(() => res(10), 10))

// $ExpectType IO<DefaultEnv, never, never>
IO.from((env, rej, res) => res(10))

// $ExpectType IO<DefaultEnv, never, string>
IO.from<DefaultEnv, never, string>((env, rej, res) => res(10))

// $ExpectType IO<DefaultEnv, never, number>
IO.of(1000)

// $ExpectType IO<DefaultEnv, number, never>
IO.reject(1000)

// $ExpectType IO<DefaultEnv, never, number>
IO.reject(1000).catch(() => IO.of(10))
