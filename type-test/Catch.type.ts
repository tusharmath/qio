/**
 * Created by tushar on 2019-04-24
 */

import {IO} from '../src/main/IO'

// $ExpectType IO<DefaultEnv, never, number>
IO.reject(new Error('!!!')).catch(() => IO.of(10))

// $ExpectType IO<DefaultEnv, never, string | number>
IO.of('OLA').catch(() => IO.of(10))

// $ExpectType IO<DefaultEnv, never, number>
IO.never().catch(() => IO.of(10))

// $ExpectType IO<DefaultEnv, never, number>
IO.of(100).catch(() => IO.never())

// $ExpectType IO<DefaultEnv, never, string | number>
IO.of(1000).catch(() => IO.of('HI'))
