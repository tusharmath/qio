/**
 * Created by tushar on 2019-05-09
 */
import {FIO} from '@fio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {RunSuite} from './internals/RunSuite'

RunSuite('Constant', {
  bluebird: () => Promise.resolve(10),
  fio: () => FIO.of(10),
  fluture: () => Fluture.of(10)
})
