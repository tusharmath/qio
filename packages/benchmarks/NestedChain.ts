import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {RunSuite} from './internals/RunSuite'

const MAX = 1e4

const flutureMapper = (_: bigint) => Fluture.of(_ + BigInt(1))
const bluebirdMapper = (_: bigint) => Promise.resolve(_ + BigInt(1))
const qioMapper = (_: bigint) => QIO.of(_ + BigInt(1))

RunSuite(`NestedChain ${MAX}`, {
  bluebird: () => {
    let bird = Promise.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      bird = bird.then(bluebirdMapper)
    }

    return bird
  },
  fluture: () => {
    let fluture = Fluture.of(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      fluture = fluture.chain(flutureMapper)
    }

    return fluture
  },
  qio: () => {
    let qio = QIO.of(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      qio = qio.chain(qioMapper)
    }

    return qio
  }
})
