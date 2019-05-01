/**
 * Created by tushar on 2019-04-15
 */

import {assert} from 'chai'
import {testScheduler} from 'ts-scheduler/test'

import {DefaultEnv} from '../src/envs/DefaultEnv'
import {IO} from '../src/main/IO'

import {Counter} from './internals/Counter'
import {ForkNRun} from './internals/ForkNRun'
import {GetTimeline} from './internals/GetTimeline'
import {IOCollector} from './internals/IOCollector'
import {
  CancellationIOSpec,
  RejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'
import {TestEnv} from './internals/TestEnv'

describe('IO', () => {
  describe('once()', () => {
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
      const env: HasConsole & TestEnv = {
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
        print(str: string): IO<DefaultEnv, Error, void>
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
        IO.accessM((_: HasConsole & DefaultEnv) => _.console.print(line))

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
    RejectingIOSpec(() => IO.accessM(() => IO.reject(new Error('FAILED'))))
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
      const env: Console & TestEnv = {
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
  describe('delay()', () => {
    ResolvingIOSpec(() => IO.of(1).delay(10))
    RejectingIOSpec(() => IO.reject(new Error('Bup!')).delay(10))
    CancellationIOSpec(cancel => cancel.delay(10))
    it('should delay the execution by the given duration', () => {
      const io = IO.from<DefaultEnv, never, number>((env1, rej, res) => {
        res(env1.scheduler.now())
      }).delay(100)

      const actual = GetTimeline(io).getValue()
      const expected = 100

      assert.strictEqual(actual, expected)
    })
  })
})
