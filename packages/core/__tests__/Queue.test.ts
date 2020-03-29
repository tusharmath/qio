import {assert} from 'chai'

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
        Queue.unbounded<number>().chain((Q) => Q.offer(1000).and(Q.length))
      )
      const expected = 1

      assert.strictEqual(actual, expected)
    })

    context('is full', () => {
      it('should not add', () => {
        const program = Queue.bounded<string>(2)
          .chain((Q) => Q.offerAll('A', 'B', 'C').const(Q))
          .chain((_) => _.asArray)

        const actual = testRuntime().unsafeExecuteSync(program)

        assert.isUndefined(actual)
      })

      it('should add on remove', () => {
        const program = Queue.bounded<string>(2)
          .chain((Q) =>
            Q.offerAll('A', 'B').and(Q.take).and(Q.offer('C')).const(Q)
          )
          .chain((_) => _.asArray)

        const actual = testRuntime().unsafeExecuteSync(program)
        const expected = ['B', 'C']

        assert.deepStrictEqual(actual, expected)
      })
    })
  })

  describe('offerAll', () => {
    it('should add multiple elements to the queue', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Queue.unbounded<number>().chain((Q) =>
          Q.offerAll(1, 2, 3, 4, 5).and(Q.length)
        )
      )
      const expected = 5

      assert.strictEqual(actual, expected)
    })

    it('should add the items on the left first', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Queue.unbounded<number>().chain((Q) =>
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
        Queue.unbounded<string>().chain((Q) =>
          Q.take.par(Q.offer('A').delay(1000)).map((_) => _[0])
        )
      )

      const expected = 'A'
      assert.strictEqual(actual, expected)
    })

    it('should empty the queue once resolved', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        Queue.unbounded<string>().chain((Q) =>
          Q.take.par(Q.offer('A').delay(1000)).and(Q.length)
        )
      )

      assert.strictEqual(actual, 0)
    })

    context('is full', () => {
      it('should resolve pending offers', () => {
        /**
         * #regression
         * Any pending offers should be consumed as soon as new space is available.
         */
        const program = Queue.bounded<string>(1).chain((Q) =>
          Q.offerAll('A', 'B').fork().and(Q.take).and(Q.asArray.delay(10))
        )

        const actual = testRuntime().unsafeExecuteSync(program)
        const expected = ['B']

        assert.deepStrictEqual(actual, expected)
      })
    })
  })

  describe('takeN', () => {
    it('should resolve after the first N offers', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        Queue.unbounded<string>().chain((Q) =>
          Q.takeN(5)
            .par(Q.offerAll('A', 'B', 'C', 'D', 'E', 'F'))
            .map((_) => _[0])
        )
      )

      const expected = ['A', 'B', 'C', 'D', 'E']
      assert.deepStrictEqual(actual, expected)
    })
  })
})
