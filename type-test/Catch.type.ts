/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../src/main/FIO'

// $ExpectType FIO<unknown, never, number>
FIO.reject(new Error('!!!')).catch(() => FIO.of(10))

// $ExpectType FIO<unknown, never, string | number>
FIO.of('OLA').catch(() => FIO.of(10))

// $ExpectType FIO<unknown, never, number>
FIO.never().catch(() => FIO.of(10))

// $ExpectType FIO<unknown, never, number>
FIO.of(100).catch(() => FIO.never())

// $ExpectType FIO<unknown, never, string | number>
FIO.of(1000).catch(() => FIO.of('HI'))
