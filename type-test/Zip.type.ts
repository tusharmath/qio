/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../src/main/FIO'

// $ExpectType FIO<DefaultEnv, never, never>
FIO.never().zip(FIO.of(10))

// $ExpectType FIO<DefaultEnv, never, never>
FIO.never().zip(FIO.never())

// $ExpectType FIO<DefaultEnv, never, [number, Date]>
FIO.of(1000).zip(FIO.of(new Date()))

// $ExpectType FIO<DefaultEnv, never, [number, Date]>
FIO.of(1000).zip(FIO.of(new Date()))
