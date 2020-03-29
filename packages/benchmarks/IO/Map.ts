/**
 * Created by tushar on 2019-05-09
 */
import * as T from '@matechs/effect'
import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {inc} from '../internals/Inc'
import {RunSuite} from '../internals/RunSuite'

RunSuite('Map', {
  bluebird: () => Promise.resolve(BigInt(10)).then(inc),
  fluture: () => Fluture.map(inc)(Fluture.resolve(BigInt(10))),
  matechs: () => T.effect.map(inc)(T.effect.pure(BigInt(10))),
  qio: () => QIO.resolve(BigInt(10)).map(inc),
})
