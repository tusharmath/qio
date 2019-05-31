/**
 * Created by tushar on 2019-05-09
 */
import * as Fluture from 'fluture'

import {FIO} from '../src/main/FIO'

import {RunSuite} from './internals/RunSuite'

const fluture = Fluture.of(10)
const fio = FIO.of(10)

RunSuite('Map', {fio, fluture})
