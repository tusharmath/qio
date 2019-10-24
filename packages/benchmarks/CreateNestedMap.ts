import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {inc} from './internals/Inc'
import {RunSuite} from './internals/RunSuite'

const MAX = 1e3

RunSuite(`CreateNestedMap ${MAX}`, {
  bluebird: () => {
    let bird = Promise.resolve(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      bird = bird.then(inc)
    }

    return bird
  },
  fluture: () => {
    let fluture = Fluture.of(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      fluture = fluture.map(inc)
    }

    return fluture
  },
  qio: () => {
    let qio = QIO.of(BigInt(0))
    for (let i = 0; i < MAX; i++) {
      qio = qio.map(inc)
    }

    return qio
  }
})
