import {assert} from 'chai'

import {Evaluator} from '../lib/internals/Evaluator'
import {Exit} from '../lib/main/Exit'
import {QIO} from '../lib/main/QIO'

describe('Evaluator', () => {
  const itSucceeds = (name: string) => <A, E>(qio: QIO<A, E>) => (a: A) => {
    it('succeeds ' + name, () => {
      const actual = Evaluator.evaluatePollOrThrow(qio)()
      assert.strictEqual(actual, a)
    })
  }

  const itFails = (name: string) => <A>(qio: QIO<A, string>) => (e: string) => {
    it('fails ' + name, () => {
      assert.throws(() => Evaluator.evaluatePollOrThrow(qio)(), e)
    })
  }

  describe('constant', () => {
    itSucceeds('should return the value')(QIO.resolve(10))(10)
  })

  describe('map', () => {
    itSucceeds('should transform the value')(
      QIO.resolve(10).map((_) => _ + 100)
    )(110)
  })

  describe('chain', () => {
    itSucceeds('should chain the value')(
      QIO.resolve(10).chain((_) => QIO.resolve(_ + 1))
    )(11)

    itSucceeds('with composition')(
      QIO.resolve(10)
        .chain((_) => QIO.resolve(_ + 1))
        .chain((_) => QIO.resolve(_ + 1))
        .chain((_) => QIO.resolve(_ + 1))
        .map((_) => _ + 1)
    )(14)
  })

  describe('reject', () => {
    itFails('should reject with failure')(QIO.reject('10'))('10')
  })

  describe('catch', () => {
    itSucceeds('should reject with failure')(QIO.reject(10).catch(QIO.resolve))(
      10
    )

    itSucceeds('should skip ops in the middle')(
      QIO.reject(10)
        .map((_) => _ + 1)
        .catch(QIO.resolve)
    )(10)

    itSucceeds('in composing')(
      QIO.reject(10)
        .catch(QIO.resolve)
        .chain((_) => QIO.resolve(_ + 10))
    )(20)
  })

  describe('callback', () => {
    itSucceeds('should resolve with success')(
      QIO.fromExitCallback<number>((cb) => cb(Exit.succeed(10)))
    )(10)

    itFails('should reject with failure')(
      QIO.fromExitCallback((cb) => cb(Exit.fail('10')))
    )('10')
  })

  describe('fromEffectTotal', () => {
    itSucceeds('with the return value')(QIO.fromEffectTotal(() => 10))(10)
  })
})
