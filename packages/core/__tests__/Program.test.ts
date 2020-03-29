import {assert} from 'chai'

import {canContinue, program} from '../../example/guess-the-number/src/Program'
import {QIO} from '../lib/main/QIO'
import {testRuntime} from '../lib/runtimes/TestRuntime'

describe('Program', () => {
  /**
   * Mock implementation for everything insde JS's native math utility
   */
  const MockMath = (...a: number[]) => ({
    random(): number {
      return a.shift() as number
    },
  })

  /**
   * Mock implementation of ITextTerminal
   */
  const MockTTY = (input: {[k: string]: string[]}) => {
    const stdout = new Array<unknown>()

    return {
      getStrLn: (question: string) =>
        QIO.tryM(() => {
          const popped = input.hasOwnProperty(question)
            ? input[question].shift()
            : undefined

          if (popped === undefined) {
            stdout.push(question)

            return QIO.never()
          }

          stdout.push(question + popped)

          return QIO.resolve(popped)
        }),
      putStrLn: (...t: unknown[]) =>
        QIO.lift(() => void stdout.push(t.join(', '))),
      stdout,
    }
  }

  it('should greet', () => {
    const math = MockMath()
    const tty = MockTTY({})
    const runtime = testRuntime()
    runtime.unsafeExecuteSync(program.provide({math, tty}))

    assert.deepStrictEqual(tty.stdout, ['Greetings!', 'Enter your name: '])
  })

  it('should ask user for a number', () => {
    const math = MockMath()
    const tty = MockTTY({
      'Enter your name: ': ['John'],
    })
    const runtime = testRuntime()
    runtime.unsafeExecuteSync(program.provide({math, tty}))

    assert.deepStrictEqual(tty.stdout, [
      'Greetings!',
      'Enter your name: John',
      'Welcome to the world of functional programming, John!',
      'Enter a number between 1 & 6: ',
    ])
  })

  it('should check match guess with random', () => {
    const math = MockMath(0.1, 0.5, 0.7)
    const tty = MockTTY({
      'Enter a number between 1 & 6: ': ['1'],
      'Enter your name: ': ['John'],
    })
    const runtime = testRuntime()
    runtime.unsafeExecuteSync(program.provide({math, tty}))

    assert.deepStrictEqual(tty.stdout, [
      'Greetings!',
      'Enter your name: John',
      'Welcome to the world of functional programming, John!',
      'Enter a number between 1 & 6: 1',
      'Sorry, the correct answer is 2',
      'Press ⏎  to continue (or will exit in 3sec): ',
      '\nGood bye!',
    ])
  })

  it('should encourage user on correct answer', () => {
    const math = MockMath(0.1, 0.5, 0.7)
    const tty = MockTTY({
      'Enter a number between 1 & 6: ': ['2'],
      'Enter your name: ': ['John'],
    })
    const runtime = testRuntime()
    runtime.unsafeExecuteSync(program.provide({math, tty}))

    assert.deepStrictEqual(tty.stdout, [
      'Greetings!',
      'Enter your name: John',
      'Welcome to the world of functional programming, John!',
      'Enter a number between 1 & 6: 2',
      'You guessed it right!',
      'Press ⏎  to continue (or will exit in 3sec): ',
      '\nGood bye!',
    ])
  })

  it('should continue on pressing enter', () => {
    const math = MockMath(0.1, 0.1, 0.1)
    const tty = MockTTY({
      'Enter a number between 1 & 6: ': ['2', '3'],
      'Enter your name: ': ['John'],
      'Press ⏎  to continue (or will exit in 3sec): ': ['', ''],
    })
    const runtime = testRuntime()
    runtime.unsafeExecuteSync(program.provide({math, tty}))

    assert.deepStrictEqual(tty.stdout, [
      'Greetings!',
      'Enter your name: John',
      'Welcome to the world of functional programming, John!',
      'Enter a number between 1 & 6: 2',
      'You guessed it right!',
      'Press ⏎  to continue (or will exit in 3sec): ',
      'Enter a number between 1 & 6: 3',
      'Sorry, the correct answer is 2',
      'Press ⏎  to continue (or will exit in 3sec): ',
      'Enter a number between 1 & 6: ',
    ])
  })

  describe('canContinue', () => {
    context('when newline is provided', () => {
      it('should return true', () => {
        const tty = MockTTY({
          'Press ⏎  to continue (or will exit in 3sec): ': [''],
        })
        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(canContinue.provide({tty}))

        assert.isTrue(actual)
      })
    })
    context('when no input is provided', () => {
      it('should return false', () => {
        const tty = MockTTY({})
        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(canContinue.provide({tty}))

        assert.isFalse(actual)
      })
      it('should output goodbye', () => {
        const tty = MockTTY({})
        const runtime = testRuntime()
        runtime.unsafeExecuteSync(canContinue.provide({tty}))

        assert.deepStrictEqual(tty.stdout, [
          'Press ⏎  to continue (or will exit in 3sec): ',
          '\nGood bye!',
        ])
      })
    })
  })
})
