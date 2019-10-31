import * as assert from 'assert'

import {Queue} from '../lib/main/Queue'
import {testRuntime} from '../lib/runtimes/TestRuntime'

describe('Queue', () => {
  describe('unbounded', () => {
    it('should create an instance of Queue', () => {
      const actual = testRuntime().unsafeExecuteSync(Queue.unbounded<number>())
      assert.ok(actual instanceof Queue)
    })
  })
  describe('capacity', () => {
    it('should return capacity', () => {
      const Q = testRuntime().unsafeExecuteSync(Queue.bounded(100)) as Queue
      assert.strictEqual(Q.capacity, 100)
    })
  })

  describe('offer', () => {
    it('should add the element to the queue', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Queue.unbounded<number>().chain(Q => Q.offer(1000).and(Q.length))
      )
      const expected = 1

      assert.strictEqual(actual, expected)
    })
  })

  describe('offerAll', () => {
    it('should add multiple elements to the queue', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Queue.unbounded<number>().chain(Q =>
          Q.offerAll(1, 2, 3, 4, 5).and(Q.length)
        )
      )
      const expected = 5

      assert.strictEqual(actual, expected)
    })

    it('should add the items on the left first', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Queue.unbounded<number>().chain(Q =>
          Q.offerAll(1, 2, 3, 4, 5).and(Q.take)
        )
      )
      const expected = 1

      assert.strictEqual(actual, expected)
    })
  })

  describe('take', () => {
    it('should wait if the queue is empty', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        Queue.unbounded<string>().chain(Q =>
          Q.take.par(Q.offer('A').delay(1000)).map(_ => _[0])
        )
      )

      const expected = 'A'
      assert.strictEqual(actual, expected)
    })

    it('should empty the queue once resolved', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        Queue.unbounded<string>().chain(Q =>
          Q.take.par(Q.offer('A').delay(1000)).and(Q.length)
        )
      )

      assert.strictEqual(actual, 0)
    })
  })
})
