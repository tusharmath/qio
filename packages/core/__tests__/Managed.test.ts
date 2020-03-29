import {Id} from '@qio/prelude'
import {deepStrictEqual} from 'assert'
import {assert} from 'chai'

import {Counter} from '../lib/main/Counter'
import {Managed} from '../lib/main/Managed'
import {QIO} from '../lib/main/QIO'
import {Snapshot} from '../lib/main/Snapshot'
import {testRuntime} from '../lib/runtimes/TestRuntime'

import {Resource} from './internals/Resource'

//#region Regression Suite
const itShouldAcquireOnce = (fn: (M: Managed) => Managed) => {
  it('should acquire only once', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      fn(Managed.make(r.acquire, QIO.void)).use(QIO.void)
    )
    assert.strictEqual(r.count, 1, `Resource was acquired ${r.count} times`)
  })
}

const itShouldReleaseOnce = (fn: (M: Managed) => Managed) => {
  it('should release only once', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      fn(Managed.make(QIO.void(), r.release)).use(QIO.void)
    )
    assert.strictEqual(r.count, -1, `Resource was released ${r.count} times`)
  })
}
const itShouldReleaseAfterUsage = (fn: (M: Managed) => Managed) => {
  it('should release after usage', () => {
    const snapshot = new Snapshot()
    testRuntime().unsafeExecuteSync(
      fn(
        Managed.make(snapshot.mark('ACQUIRED'), () => snapshot.mark('RELEASED'))
      ).use(() => snapshot.mark('USED'))
    )
    assert.deepStrictEqual(snapshot.timeline, [
      'ACQUIRED@1',
      'USED@1',
      'RELEASED@1',
    ])
  })
}

const itShouldFollowSpec = (fn: (M: Managed) => Managed) => {
  itShouldAcquireOnce(fn)
  itShouldReleaseOnce(fn)
  itShouldReleaseAfterUsage(fn)
}
//#endregion

describe('Managed', () => {
  context('on failure', () => {
    it('should release resource', () => {
      const r = Resource()
      testRuntime().unsafeExecuteSync(
        Managed.make(r.acquire, r.release).use(() => QIO.reject('Failure'))
      )
      assert.strictEqual(r.count, 0)
    })
  })
  context('on success', () => {
    it('should release resource', () => {
      const r = Resource()
      testRuntime().unsafeExecuteSync(
        Managed.make(r.acquire, r.release).use(() => QIO.void())
      )
      assert.strictEqual(r.count, 0)
    })
  })
  context('on cancellation', () => {
    it('should release resource', () => {
      const r = Resource()
      const runtime = testRuntime()

      runtime.unsafeExecuteSync(
        Managed.make(r.acquire, r.release)
          .use(() => QIO.timeout(0, 1000))
          .fork()
          .chain((F) => F.abort.delay(500))
      )

      assert.ok(r.isReleased)
    })

    it('should abort usage', () => {
      const runtime = testRuntime()
      const counter = new Counter()

      runtime.unsafeExecuteSync(
        Managed.make(QIO.void(), QIO.void)
          .use(() => counter.inc().delay(1000))
          .fork()
          .chain((F) => F.abort.delay(500))
      )

      assert.deepStrictEqual(counter.count, 0)
    })

    // Keep it for regression
    it('should release only once on abort', () => {
      const r = Resource()
      const runtime = testRuntime()

      runtime.unsafeExecuteSync(
        Managed.make(r.acquire, r.release)
          .use(() => QIO.timeout(0, 1000))
          .fork()
          .chain((F) => F.join.and(F.abort))
      )

      assert.strictEqual(r.count, 0)
    })
  })

  it('should return the cause of the failure', () => {
    const r = Resource()
    const actual = testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, r.release).use(() =>
        QIO.reject<'Failure'>('Failure')
      )
    )
    assert.strictEqual(actual, 'Failure')
  })

  it('should hold resource until completion', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, r.release).use(QIO.never)
    )

    assert.strictEqual(r.count, 1)
  })

  it('should acquire the resource', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, QIO.void).use(QIO.void)
    )

    assert.strictEqual(r.count, 1)
  })

  it('should acquire only once', () => {
    const r = Resource()

    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, QIO.void).use(QIO.void)
    )

    assert.strictEqual(r.count, 1)
  })

  it('should reject if release causes an error', () => {
    const runtime = testRuntime()

    const actual = runtime.unsafeExecuteSync(
      Managed.make(QIO.void(), () =>
        QIO.reject(new Error('FAILURE_ON_CLOSURE'))
      ).use(QIO.void)
    )

    const expected = new Error('FAILURE_ON_CLOSURE')
    deepStrictEqual(actual, expected)
  })

  describe('zip', () => {
    it('should create resources simultaneously', () => {
      const A = Resource(10)
      const B = Resource(100)
      const C = Resource(1000)
      const M = Managed.zip([
        Managed.make(A.acquire, A.release),
        Managed.make(B.acquire, B.release),
        Managed.make(C.acquire, C.release),
      ])

      const actual = testRuntime().unsafeExecuteSync(M.use(QIO.resolve))
      const expected = [11, 101, 1001]

      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('chain', () => {
    itShouldFollowSpec((m) => m.chain(() => Managed.make(QIO.void(), QIO.void)))
  })

  describe('map', () => {
    itShouldFollowSpec((m) => m.map(() => 0))
  })

  describe('id', () => {
    itShouldFollowSpec(Id)
  })
})
