/**
 * Created by tushar on 2019-05-11
 */

import * as Fluture from 'fluture'

import {FIO} from '../src/main/FIO'

import {inc} from './internals/Inc'
import {RunSuite} from './internals/RunSuite'

const MAX = 1e3

let fluture = Fluture.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fluture = fluture.map(inc)
}

let fio = FIO.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fio = fio.map(inc)
}

RunSuite(`NestedMap ${MAX}`, {fio, fluture})
