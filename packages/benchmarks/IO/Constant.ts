/**
 * Created by tushar on 2019-05-09
 */
import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {RunSuite} from '../internals/RunSuite'

RunSuite('Constant', {
  bluebird: () => Promise.resolve(10),
  fluture: () => Fluture.of(10),
  qio: () => QIO.of(10)
})
