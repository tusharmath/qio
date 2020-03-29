/**
 * Created by tushar on 2019-05-11
 */

import * as T from '@matechs/effect'
import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {inc} from '../internals/Inc'
import {RunSuite} from '../internals/RunSuite'

const MAX = 1e3

RunSuite(`NestedMap ${MAX}`, {
  bluebird: () => {
    let bird = Promise.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      bird = bird.then(inc)
    }

    return bird
  },
  fluture: () => {
    let fluture = Fluture.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      fluture = Fluture.map(inc)(fluture)
    }

    return fluture
  },
  matechs: () => {
    let io = T.effect.pure(0n)
    for (let i = 0; i < MAX; i++) {
      io = T.effect.map(inc)(io)
    }

    return io
  },
  qio: () => {
    let qio = QIO.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      qio = qio.map(inc)
    }

    return qio
  },
})
