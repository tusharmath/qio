/* tslint:disable: promise-function-async strict-comparisons */

import {effect as T} from '@matechs/effect'
import {QIO} from '@qio/core'
import {Promise} from 'bluebird'
import * as Fluture from 'fluture'

import {RunSuite} from '../internals/RunSuite'

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
    return Fluture.resolve(1n)
  }

  return Fluture.chain((a: bigint) =>
    Fluture.map((b: bigint) => a + b)(fibFluture(n - 2n))
  )(fibFluture(n - 1n))
}

/**
 * QIO based implementation
 */
export const fibQIO = (n: bigint): QIO<bigint> => {
  if (n < 2n) {
    return QIO.resolve(1n)
  }

  return fibQIO(n - 1n).chain((a) => fibQIO(n - 2n).map((b) => a + b))
}

/**
 * Bluebird based implementation
 */
export const fibBird = (n: bigint): Promise<bigint> => {
  if (n < 2n) {
    return Promise.resolve(1n)
  }

  return fibBird(n - 1n).then((a) => fibBird(n - 2n).then((b) => a + b))
}

/**
 * Matechs based implementation
 */
export const fibMatechs = (n: bigint): T.Effect<T.NoEnv, never, bigint> => {
  if (n < BigInt(2)) {
    return T.pure(BigInt(1))
  }

  return T.effect.chain(fibMatechs(n - BigInt(1)), (a) =>
    T.effect.map(fibMatechs(n - BigInt(2)), (b) => a + b)
  )
}

const count = 20n
RunSuite(`Fibonacci: ${String(count)}`, {
  bluebird: () => fibBird(count),
  fluture: () => fibFluture(count),
  matechs: () => fibMatechs(count),
  native: () => fib(count),
  qio: () => fibQIO(count),
})
