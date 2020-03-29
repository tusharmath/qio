import {assert, spy} from 'chai'

import {Await} from '../lib/main/Await'
import {Counter} from '../lib/main/Counter'
import {Exit} from '../lib/main/Exit'
import {QIO} from '../lib/main/QIO'
import {testRuntime} from '../lib/runtimes/TestRuntime'

describe('Await', () => {
  describe('of', () => {
    it('should create an instance of Await', () => {
      const actual = testRuntime().unsafeExecuteSync(Await.of())
      assert.instanceOf(actual, Await)
    })
  })

  describe('set', () => {
    it('should return true', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Await.of<string>().chain((await) => await.set(QIO.resolve('Hi')))
      )
      assert.ok(actual)
    })
    it('should set only once', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        Await.of<string>().chain((await) =>
          await
            .set(QIO.resolve('Hi'))
            .and(await.set(QIO.resolve('Bye')))
            .and(await.get)
        )
      )
      assert.strictEqual(actual, 'Hi')
    })

    it('should evaluate the IO only once', () => {
      const counter = new Counter()
      testRuntime().unsafeExecuteSync(
        Await.of<number>().chain((await) =>
          await.set(counter.inc()).and(await.set(counter.inc())).and(await.get)
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
      const AWT = runtime.unsafeExecuteSync(Await.of<number>()) as Await<
        number,
        never
      >
      // Counter
      const counter = new Counter()
      // Create an IO that takes a second to run
      runtime.unsafeExecuteSync(AWT.set(counter.inc().delay(1000)))
      // Run till 500 (half time for the original IO
      runtime.scheduler.runTo(500)
      // Again try setting another IO
      // This time the IO shouldn't execute
      runtime.unsafeExecute(AWT.set(counter.inc()))

      // Run the IO till the very end
      runtime.scheduler.run()

      const actual = counter.count
      const expected = 1
      assert.strictEqual(actual, expected)
    })

    it('should return false if its not set', () => {
      const runtime = testRuntime()
      const actual = runtime.unsafeExecuteSync(
        Await.of<string>().chain((await) =>
          await.set(QIO.resolve('Hi')).and(await.set(QIO.resolve('Bye')))
        )
      )
      assert.notOk(actual)
    })

    context('double call', () => {
      it('should return false for second try', () => {
        type AA = Await<number, never>
        const runtime = testRuntime()
        const awt = runtime.unsafeExecuteSync(Await.of<number>()) as AA

        runtime.unsafeExecute(awt.set(QIO.resolve(10).delay(100)))
        runtime.scheduler.runTo(50)

        const actual = runtime.unsafeExecuteSync(
          awt.set(QIO.resolve(10).delay(20))
        )

        assert.notOk(actual)
      })
    })
  })

  describe('get', () => {
    it('should return the IO value', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Await.of<string>().chain((await) =>
          await.set(QIO.resolve('Hi')).and(await.get)
        )
      )
      assert.strictEqual(actual, 'Hi')
    })
    it('should not resolve unless set', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Await.of<string>().chain((await) => await.get)
      )
      assert.isUndefined(actual)
    })
    it('should not return', () => {
      const runtime = testRuntime()
      const await = runtime.unsafeExecuteSync(Await.of<string>()) as Await<
        string,
        never
      >
      const res = spy()
      runtime.unsafeExecute(await.get, res)
      runtime.unsafeExecute(await.set(QIO.timeout('Hey', 1000)))

      res.should.not.be.called()
      runtime.scheduler.run()
      res.should.be.called.with(Exit.succeed('Hey'))
    })
  })

  describe('isSet', () => {
    it('should return false initially', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Await.of<string>().chain((await) => await.isSet)
      )
      assert.notOk(actual)
    })
    it('should return true after setting', () => {
      const actual = testRuntime().unsafeExecuteSync(
        Await.of<number>().chain((await) =>
          await.set(QIO.resolve(100)).and(await.isSet)
        )
      )

      assert.ok(actual)
    })

    it('should return true after the IO resolves', () => {
      type AA = Await<number, never>
      const runtime = testRuntime()
      const awt = runtime.unsafeExecuteSync(Await.of<number>()) as AA
      runtime.unsafeExecute(awt.set(QIO.resolve(10).delay(100)))
      runtime.scheduler.runTo(50)

      const actual = runtime.unsafeExecuteSync(awt.isSet)
      assert.notOk(actual)
    })
  })
})
