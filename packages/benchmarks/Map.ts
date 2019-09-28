/**
 * Created by tushar on 2019-05-09
 */
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {FIO} from '../packages/core/src/main/FIO'

import {inc} from './internals/Inc'
import {RunSuite} from './internals/RunSuite'

RunSuite('Map', {
  bluebird: () => Promise.resolve(BigInt(10)).then(inc),
  fio: () => FIO.of(BigInt(10)).map(inc),
  fluture: () => Fluture.of(BigInt(10)).map(inc)
})
