import {deepStrictEqual} from 'assert'
import {assert} from 'chai'

import {Managed} from '../lib/main/Managed'
import {QIO} from '../lib/main/QIO'
import {testRuntime} from '../lib/runtimes/TestRuntime'

describe('Managed', () => {
  const Resource = () => {
    let i = 0

    return {
      acquire: QIO.lift(() => i++),
      release: QIO.encase(() => void i--),
      get count(): number {
        return i
      },
      get isReleased(): boolean {
        return i === 0
      }
    }
  }

  it('should release resource on exception', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, r.release).use(() => QIO.reject('Failure'))
    )
    assert.strictEqual(r.count, 0)
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

  it('should release resource on completion', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, r.release).use(() => QIO.void())
    )
    assert.strictEqual(r.count, 0)
  })

  it('should acquire the resource', () => {
    const r = Resource()
    testRuntime().unsafeExecuteSync(
      Managed.make(r.acquire, QIO.void).use(QIO.void)
    )

    assert.strictEqual(r.count, 1)
  })

  it('should release resource on cancellation', () => {
    const r = Resource()
    const runtime = testRuntime()

    runtime.unsafeExecuteSync(
      Managed.make(r.acquire, r.release)
        .use(() => QIO.timeout(0, 1000))
        .fork.chain(F => F.abort.delay(500))
    )

    assert.ok(r.isReleased)
  })

  it('should release only once', () => {
    const r = Resource()
    const runtime = testRuntime()

    runtime.unsafeExecuteSync(
      Managed.make(r.acquire, r.release)
        .use(() => QIO.timeout(0, 1000))
        .fork.chain(F => F.join.and(F.abort))
    )

    assert.strictEqual(r.count, 0)
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
})
