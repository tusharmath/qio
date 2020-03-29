/**
 * Created by tushar on 2019-05-09
 */
import * as T from '@matechs/effect'
import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {RunSuite} from '../internals/RunSuite'

RunSuite('Constant', {
  bluebird: () => Promise.resolve(10),
  fluture: () => Fluture.resolve(10),
  matechs: () => T.effect.pure(10),
  qio: () => QIO.resolve(10),
})
