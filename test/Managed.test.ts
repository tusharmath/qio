import * as assert from 'assert'

import {FIO} from '../src/main/FIO'
import {Managed} from '../src/main/Managed'
import {testRuntime} from '../src/runtimes/TestRuntime'

describe('Managed', () => {
  const Resource = () => {
    let i = 0

    return {
      acquire: FIO.uio(() => i++),
      release: FIO.encase(() => void i--),
      get count(): number {
        return i
      }
    }
  }

  it('should release resource on exception', () => {
    const r = Resource()
    testRuntime().executeSync(
      Managed.make(r.acquire, r.release).use(() => FIO.reject('Failure'))
    )
    assert.strictEqual(r.count, 0)
  })

  it('should return the cause of the failure', () => {
    const r = Resource()
    const actual = testRuntime().executeSync(
      Managed.make(r.acquire, r.release).use(() =>
        FIO.reject<'Failure'>('Failure')
      )
    )
    assert.strictEqual(actual, 'Failure')
  })

  it('should release resource on completion', () => {
    const r = Resource()
    testRuntime().executeSync(
      Managed.make(r.acquire, r.release).use(() => FIO.void())
    )
    assert.strictEqual(r.count, 0)
  })
})
