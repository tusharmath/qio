/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../'
import {DefaultEnv} from '../src/envs/DefaultEnv'

// $ExpectType FIO<DefaultEnv, never, never>
FIO.from((env1, rej, res) => res(10))

// $ExpectType FIO<DefaultEnv, never, never>
FIO.from((env: DefaultEnv, rej, res) => env.scheduler.delay(() => res(10), 10))

// $ExpectType FIO<DefaultEnv, never, never>
FIO.from((env, rej, res) => res(10))

// $ExpectType FIO<DefaultEnv, never, string>
FIO.from<DefaultEnv, never, string>((env, rej, res) => res(10))

// $ExpectType FIO<DefaultEnv, never, number>
FIO.of(1000)

// $ExpectType FIO<DefaultEnv, number, never>
FIO.reject(1000)

// $ExpectType FIO<DefaultEnv, never, number>
FIO.reject(1000).catch(() => FIO.of(10))
