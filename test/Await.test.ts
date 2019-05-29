import {assert} from 'chai'
import {Await} from '../src/main/Await'
import {FIO} from '../src/main/FIO'
import {testRuntime} from '../src/runtimes/TestRuntime'

describe('Await', () => {
  describe('of', () => {
    it('should create an instance of Await', () => {
      const actual = testRuntime({color: 'red'}).executeSync(Await.of())
      assert.instanceOf(actual, Await)
    })
  })

  describe('set', () => {
    it('should return true', () => {
      const actual = testRuntime({color: 'red'}).executeSync(
        Await.of<never, string>().chain(await => await.set(FIO.of('Hi')))
      )
      assert.ok(actual)
    })
  })

  describe('set', () => {
    it('should return true', () => {
      const actual = testRuntime({color: 'red'}).executeSync(
        Await.of<never, string>().chain(await => await.set(FIO.of('Hi')))
      )
      assert.ok(actual)
    })
    it('should set only once', () => {
      const runtime = testRuntime({color: 'red'})
      const actual = runtime.executeSync(
        Await.of<never, string>().chain(await =>
          await
            .set(FIO.of('Hi'))
            .and(await.set(FIO.of('Bye')))
            .and(await.get())
        )
      )
      assert.strictEqual(actual, 'Hi')
    })

    it('should return false if its not set', () => {
      const runtime = testRuntime({color: 'red'})
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
      const actual = testRuntime({color: 'red'}).executeSync(
        Await.of<never, string>().chain(await =>
          await.set(FIO.of('Hi')).and(await.get())
        )
      )
      assert.strictEqual(actual, 'Hi')
    })

    it('should not resolve unless set', () => {
      const actual = testRuntime({color: 'red'}).executeSync(
        Await.of<never, string>().chain(await => await.get())
      )
      assert.isUndefined(actual)
    })

    it('should not return', () => {
      const runtime = testRuntime({color: 'red'})
      const await = runtime.executeSync(Await.of<never, string>()) as Await<
        never,
        string
      >
      let actual: string | undefined
      runtime.execute(await.get(), r => (actual = r))
      runtime.execute(await.set(FIO.timeout('Hey', 1000)))

      assert.isUndefined(actual)
      runtime.scheduler.run()
      assert.strictEqual(actual, 'Hey')
    })
  })

  describe('isSet()', () => {
    it('should return false initially', () => {
      const actual = testRuntime({color: 'red'}).executeSync(
        Await.of<never, string>().chain(await => await.isSet())
      )

      assert.notOk(actual)
    })

    it('should return true after setting', () => {
      const actual = testRuntime({color: 'red'}).executeSync(
        Await.of<never, number>().chain(await =>
          await.set(FIO.of(100)).and(await.isSet())
        )
      )

      assert.ok(actual)
    })
  })
})
