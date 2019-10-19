/* tslint:disable: promise-function-async strict-comparisons */

import {FIO, UIO} from '@fio/core/main/FIO'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {RunSuite} from './internals/RunSuite'

/**
 * Normal Fibonacci Implementation
 */
export const fib = (n: bigint): bigint => {
  if (n < 2n) {
    return 1n
  }

  return fib(n - 1n) + fib(n - 2n)
}

/**
 * Fluture based implementation
 */
export const fibFluture = (
  n: bigint
): Fluture.FutureInstance<never, bigint> => {
  if (n < 2n) {
    return Fluture.of(1n)
  }

  return fibFluture(n - 1n).chain(a => fibFluture(n - 2n).map(b => a + b))
}

/**
 * FIO based implementation
 */
export const fibFIO = (n: bigint): UIO<bigint> => {
  if (n < 2n) {
    return FIO.of(1n)
  }

  return fibFIO(n - 1n).chain(a => fibFIO(n - 2n).map(b => a + b))
}

/**
 * Bluebird based implementation
 */
export const fibBird = (n: bigint): Promise<bigint> => {
  if (n < 2n) {
    return Promise.resolve(1n)
  }

  return fibBird(n - 1n).then(a => fibBird(n - 2n).then(b => a + b))
}

const count = 20n
RunSuite(`Fibonacci: ${String(count)}`, {
  bluebird: () => fibBird(count),
  fio: () => fibFIO(count),
  fluture: () => fibFluture(count),
  native: () => fib(count)
})
