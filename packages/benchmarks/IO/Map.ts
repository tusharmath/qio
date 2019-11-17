/**
 * Created by tushar on 2019-05-09
 */
import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {inc} from '../internals/Inc'
import {RunSuite} from '../internals/RunSuite'

RunSuite('Map', {
  bluebird: () => Promise.resolve(BigInt(10)).then(inc),
  fluture: () => Fluture.of(BigInt(10)).map(inc),
  qio: () => QIO.resolve(BigInt(10)).map(inc)
})
