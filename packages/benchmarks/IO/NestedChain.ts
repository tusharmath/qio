import * as T from '@matechs/effect'
import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {RunSuite} from '../internals/RunSuite'

const MAX = 1e4

const flutureMapper = (_: bigint) => Fluture.resolve(_ + BigInt(1))
const bluebirdMapper = (_: bigint) => Promise.resolve(_ + BigInt(1))
const qioMapper = (_: bigint) => QIO.resolve(_ + BigInt(1))
const matechsMapper = (_: bigint) => T.effect.pure(_ + BigInt(1))

RunSuite(`NestedChain ${MAX}`, {
  bluebird: () => {
    let bird = Promise.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      bird = bird.then(bluebirdMapper)
    }

    return bird
  },
  fluture: () => {
    let fluture = Fluture.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      fluture = Fluture.chain(flutureMapper)(fluture)
    }

    return fluture
  },
  matechs: () => {
    let io = T.effect.pure(0n)
    for (let i = 0; i < MAX; i++) {
      io = T.effect.chain(matechsMapper)(io)
    }

    return io
  },
  qio: () => {
    let qio = QIO.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      qio = qio.chain(qioMapper)
    }

    return qio
  },
})
