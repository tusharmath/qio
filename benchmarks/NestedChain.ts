import * as Fluture from 'fluture'

import {FIO} from '../src/main/FIO'

import {RunSuite} from './internals/RunSuite'

const MAX = 1e4

const flutureMapper = (_: bigint) => Fluture.of(_ + BigInt(1))
let fluture = Fluture.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fluture = fluture.chain(flutureMapper)
}

const fioMapper = (_: bigint) => FIO.of(_ + BigInt(1))
let fio = FIO.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fio = fio.chain(fioMapper)
}

RunSuite(`NestedChain ${MAX}`, {fio, fluture})
