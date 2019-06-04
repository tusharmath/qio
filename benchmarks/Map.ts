/**
 * Created by tushar on 2019-05-09
 */
import * as Fluture from 'fluture'

import {FIO} from '../src/main/FIO'

import {inc} from './internals/Inc'
import {RunSuite} from './internals/RunSuite'

const fluture = Fluture.of(BigInt(10)).map(inc)
const fio = FIO.of(BigInt(10)).map(inc)

RunSuite('Map', {fio, fluture})
