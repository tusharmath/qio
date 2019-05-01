/**
 * Created by tushar on 2019-04-24
 */

import {IO} from '../src/main/IO'

// $ExpectType IO<DefaultEnv, never, never>
IO.never().race(IO.never())

// $ExpectType IO<DefaultEnv, never, number>
IO.never().race(IO.of(10))

// $ExpectType IO<DefaultEnv, never, number>
IO.never().race(IO.of(10))

// $ExpectType IO<DefaultEnv, never, number | Date>
IO.of(1000).race(IO.of(new Date()))

// $ExpectType IO<DefaultEnv, number, never>
IO.never().race(IO.reject(10))
