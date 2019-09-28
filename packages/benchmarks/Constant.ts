/**
 * Created by tushar on 2019-05-09
 */
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {FIO} from '../packages/core/src/main/FIO'

import {RunSuite} from './internals/RunSuite'

RunSuite('Constant', {
  bluebird: () => Promise.resolve(10),
  fio: () => FIO.of(10),
  fluture: () => Fluture.of(10)
})
