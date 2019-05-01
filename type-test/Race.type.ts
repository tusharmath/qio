/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../src/main/FIO'

// $ExpectType FIO<DefaultEnv, never, never>
FIO.never().race(FIO.never())

// $ExpectType FIO<DefaultEnv, never, number>
FIO.never().race(FIO.of(10))

// $ExpectType FIO<DefaultEnv, never, number>
FIO.never().race(FIO.of(10))

// $ExpectType FIO<DefaultEnv, never, number | Date>
FIO.of(1000).race(FIO.of(new Date()))

// $ExpectType FIO<DefaultEnv, number, never>
FIO.never().race(FIO.reject(10))
