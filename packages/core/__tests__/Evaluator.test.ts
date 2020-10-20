import {assert} from 'chai'

import {Evaluator} from '../lib/internals/Evaluator'
import {Exit} from '../lib/main/Exit'
import {QIO} from '../lib/main/QIO'

describe('Evaluator', () => {
  const succeed = <A, E>(qio: QIO<A, E>) => (a: A) => {
    const actual = Evaluator.evaluatePollOrThrow(qio)()
    assert.strictEqual(actual, a)
  }

  const fail = <A>(qio: QIO<A, string>) => (e: string) => {
    assert.throws(() => Evaluator.evaluatePollOrThrow(qio)(), e)
  }

  describe('constant', () => {
    it('should return the value', () => {
      succeed(QIO.resolve(10))(10)
    })
  })

  describe('map', () => {
    it('should transform the value', () => {
      succeed(QIO.resolve(10).map((_) => _ + 100))(110)
    })
  })

  describe('chain', () => {
    it('should chain the value', () =>
      succeed(QIO.resolve(10).chain((_) => QIO.resolve(_ + 1)))(11))

    it('with composition', () =>
      succeed(
        QIO.resolve(10)
          .chain((_) => QIO.resolve(_ + 1))
          .chain((_) => QIO.resolve(_ + 1))
          .chain((_) => QIO.resolve(_ + 1))
          .map((_) => _ + 1)
      )(14))
  })

  describe('reject', () => {
    it('should reject with failure', () => {
      fail(QIO.reject('10'))('10')
    })
  })

  describe('catch', () => {
    it('should reject with failure', () => {
      succeed(QIO.reject(10).catch(QIO.resolve))(10)
    })

    it('should skip ops in the middle', () => {
      succeed(
        QIO.reject(10)
          .map((_) => _ + 1)
          .catch(QIO.resolve)
      )(10)
    })

    it('in composing', () => {
      succeed(
        QIO.reject(10)
          .catch(QIO.resolve)
          .chain((_) => QIO.resolve(_ + 10))
      )(20)
    })
  })

  describe('callback', () => {
    it('should resolve with success', () => {
      succeed(
        QIO.fromExitCallback<number>((cb) => cb(Exit.succeed(10)))
      )(10)
    })

    it('should reject with failure', () => {
      fail(QIO.fromExitCallback((cb) => cb(Exit.fail('10'))))('10')
    })
  })

  describe('fromEffectTotal', () => {
    it('with the return value', () => {
      succeed(QIO.fromEffectTotal(() => 10))(10)
    })
  })
})
