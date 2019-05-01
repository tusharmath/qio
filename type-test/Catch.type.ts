/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../src/main/FIO'

// $ExpectType FIO<DefaultEnv, never, number>
FIO.reject(new Error('!!!')).catch(() => FIO.of(10))

// $ExpectType FIO<DefaultEnv, never, string | number>
FIO.of('OLA').catch(() => FIO.of(10))

// $ExpectType FIO<DefaultEnv, never, number>
FIO.never().catch(() => FIO.of(10))

// $ExpectType FIO<DefaultEnv, never, number>
FIO.of(100).catch(() => FIO.never())

// $ExpectType FIO<DefaultEnv, never, string | number>
FIO.of(1000).catch(() => FIO.of('HI'))
