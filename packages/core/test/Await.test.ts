import {assert} from 'chai'

import {Await} from '../src/main/Await'
import {FIO} from '../src/main/FIO'
import {testRuntime} from '../src/runtimes/TestRuntime'

import {Counter} from './internals/Counter'

describe('Await', () => {
  describe('of', () => {
    it('should create an instance of Await', () => {
      const actual = testRuntime().executeSync(Await.of())
      assert.instanceOf(actual, Await)
    })
  })

  describe('set', () => {
    it('should return true', () => {
      const actual = testRuntime().executeSync(
        Await.of<never, string>().chain(await => await.set(FIO.of('Hi')))
      )
      assert.ok(actual)
    })
    it('should set only once', () => {
      const runtime = testRuntime()
      const actual = runtime.executeSync(
        Await.of<never, string>().chain(await =>
          await
            .set(FIO.of('Hi'))
            .and(await.set(FIO.of('Bye')))
            .and(await.get)
        )
      )
      assert.strictEqual(actual, 'Hi')
    })

    it('should evaluate the IO only once', () => {
      const counter = new Counter()
      testRuntime().executeSync(
        Await.of<never, number>().chain(await =>
          await
            .set(counter.inc())
            .and(await.set(counter.inc()))
            .and(await.get)
        )
      )
      assert.strictEqual(counter.count, 1)
    })

    /**
     * This case comes in when Await.set() is called concurrently multiple number of times.
     * That way the first IO might have not actually completed but the second is still sent again.
     */
    it('should run only for long running IOs', () => {
      const runtime = testRuntime()

      // Create Await instance
      const actual = runtime
        .exit(Await.of<never, number>())
        .map(AWT => {
          // Counter
          const counter = new Counter()

          // Create an IO that takes a second to run
          runtime.execute(AWT.set(counter.inc().delay(1000)))

          // Run till 500 (half time for the original IO
          runtime.scheduler.runTo(500)

          // Again try setting another IO
          // This time the IO shouldn't execute
          runtime.execute(AWT.set(counter.inc()))

          // Run the IO till the very end
          runtime.scheduler.run()

          return counter.count
        })
        .getRightOrElse(-1)

      const expected = 1
      assert.strictEqual(actual, expected)
    })

    it('should return false if its not set', () => {
      const runtime = testRuntime()
      const actual = runtime.executeSync(
        Await.of<never, string>().chain(await =>
          await.set(FIO.of('Hi')).and(await.set(FIO.of('Bye')))
        )
      )
      assert.notOk(actual)
    })
  })

  describe('get', () => {
    it('should return the IO value', () => {
      const actual = testRuntime().executeSync(
        Await.of<never, string>().chain(await =>
          await.set(FIO.of('Hi')).and(await.get)
        )
      )
      assert.strictEqual(actual, 'Hi')
    })

    it('should not resolve unless set', () => {
      const actual = testRuntime().executeSync(
        Await.of<never, string>().chain(await => await.get)
      )
      assert.isUndefined(actual)
    })

    it('should not return', () => {
      const runtime = testRuntime()
      const await = runtime.executeSync(Await.of<never, string>()) as Await<
        never,
        string
      >
      let actual: string | undefined
      runtime.execute(await.get, r => (actual = r))
      runtime.execute(await.set(FIO.timeout('Hey', 1000)))

      assert.isUndefined(actual)
      runtime.scheduler.run()
      assert.strictEqual(actual, 'Hey')
    })
  })

  describe('isSet', () => {
    it('should return false initially', () => {
      const actual = testRuntime().executeSync(
        Await.of<never, string>().chain(await => await.isSet)
      )

      assert.notOk(actual)
    })

    it('should return true after setting', () => {
      const actual = testRuntime().executeSync(
        Await.of<never, number>().chain(await =>
          await.set(FIO.of(100)).and(await.isSet)
        )
      )

      assert.ok(actual)
    })
  })
})
