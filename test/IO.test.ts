/**
 * Created by tushar on 2019-04-15
 */

import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {AnyEnv} from '../src/envs/AnyEnv'
import {SchedulerEnv} from '../src/envs/SchedulerEnv'
import {IO} from '../src/main/IO'

import {Counter} from './internals/Counter'
import {ForkNRun} from './internals/ForkNRun'
import {IOCollector} from './internals/IOCollector'
import {RejectingIOSpec, ResolvingIOSpec} from './internals/IOSpecification'
import {$} from './internals/ProxyFunction'
import {TestSchedulerEnv} from './internals/TestSchedulerEnv'

describe('IO', () => {
  describe('once()', () => {
    context('typings', () => {
      it('should return a an IO< IO< A > >', () => {
        interface TestENV {
          name: IO<SchedulerEnv, string>
        }
        $(
          (_: IO<TestENV, number>): IO<SchedulerEnv, IO<TestENV, number>> =>
            _.once()
        )
      })
    })
    it('should not throw to exit on calling once', () => {
      assert.doesNotThrow(() => IO.of(10).once())
    })
    it('should return an IO that is memoized', () => {
      const counter = Counter()
      const S = testScheduler()
      const ioP = ForkNRun({scheduler: S}, counter.inc.once())
      const ioC = IOCollector({scheduler: S}, ioP.timeline.getValue())
      ioC.fork()
      ioC.fork()
      S.run()

      const actual = counter.getCount()
      const expected = 1
      assert.strictEqual(actual, expected)
    })
  })
  describe('provide()', () => {
    ResolvingIOSpec(() => IO.of(10).provide({scheduler: testScheduler()}))
    RejectingIOSpec(() =>
      IO.reject(new Error('FAILED')).provide({scheduler: testScheduler()})
    )

    it('should pass on the env', () => {
      const env = {scheduler: testScheduler(), test: {a: 'a', b: 'b'}}
      const {timeline} = ForkNRun(env, IO.of(10).provide(env))
      const actual = timeline.list()
      const expected = [['RESOLVE', 1, 10]]

      assert.deepStrictEqual(actual, expected)
    })
  })
  describe('access()', () => {
    it('should create an IO[R, A] ', () => {
      interface Console {
        print(str: string): void
      }

      interface HasConsole {
        console: Console
      }

      const Console = () => {
        const strings = new Array<string>()

        return {
          list: () => strings.slice(0),
          print: (str: string) => void strings.push(str)
        }
      }

      const putStrLn = (line: string) =>
        IO.access((_: HasConsole) => _.console.print(line))

      const cons = Console()
      const env: HasConsole & TestSchedulerEnv = {
        console: cons,
        scheduler: testScheduler()
      }
      ForkNRun(env, putStrLn('HELLO WORLD'))

      const actual = cons.list()
      const expected = ['HELLO WORLD']

      assert.deepStrictEqual(actual, expected)
    })
    ResolvingIOSpec(() => IO.access(() => 10))
    RejectingIOSpec(() =>
      IO.access(() => {
        throw new Error('FAILED')
      })
    )
  })

  describe('accessM()', () => {
    it('should create an IO[R, A] ', () => {
      interface Console {
        print(str: string): IO<AnyEnv, void>
      }

      interface HasConsole {
        console: Console
      }

      const Console = () => {
        const strings = new Array<string>()

        return {
          list: () => strings.slice(0),
          print: IO.encase((str: string) => void strings.push(str))
        }
      }

      const putStrLn = (line: string) =>
        IO.accessM((_: HasConsole) => _.console.print(line))

      const cons = Console()
      const env = {console: cons, scheduler: testScheduler()}
      ForkNRun(env, putStrLn('HELLO WORLD'))

      const actual = cons.list()
      const expected = ['HELLO WORLD']

      assert.deepStrictEqual(actual, expected)
    })
    ResolvingIOSpec(() => IO.accessM(() => IO.of(10)))
    RejectingIOSpec(() =>
      IO.accessM(() => {
        throw new Error('FAILED')
      })
    )
  })
  describe('environment()', () => {
    it('should return the env its being forked with', () => {
      interface Console {
        console: {print(str: string): void}
      }
      const io = IO.environment<Console>()
      const out = new Array<string>()
      const ConsoleService = {
        print: (str: string): void => {
          out.push(str)
        }
      }
      const env: Console & TestSchedulerEnv = {
        console: ConsoleService,
        scheduler: testScheduler()
      }
      const {timeline} = ForkNRun(env, io)

      const actual = timeline.getValue().console
      const expected = ConsoleService

      assert.strictEqual(actual, expected)
    })

    ResolvingIOSpec(() => IO.environment())
  })
})
