import {testTTY} from '@qio/console'
import {testRuntime} from '@qio/core'
import {assert} from 'chai'

import {canContinue, program} from '../guess-the-number/src/Program'

describe('Program', () => {
  /**
   * Mock implementation for everything inside JS's native math utility
   */
  const mockMath = (...a: number[]) => ({
    random(): number {
      return a.shift() as number
    }
  })

  it('should greet', () => {
    const math = mockMath()
    const tty = testTTY({})
    const runtime = testRuntime()
    runtime.unsafeExecuteSync(program.provide({math, tty}))

    assert.deepStrictEqual(tty.stdout, ['Greetings!', 'Enter your name: '])
  })

  it('should ask user for a number', () => {
    const math = mockMath()
    const tty = testTTY({
      'Enter your name: ': ['John']
    })
    const runtime = testRuntime()
    runtime.unsafeExecuteSync(program.provide({math, tty}))

    assert.deepStrictEqual(tty.stdout, [
      'Greetings!',
      'Enter your name: John',
      'Welcome to the world of functional programming, John!',
      'Enter a number between 1 & 6: '
    ])
  })

  it('should check match guess with random', () => {
    const math = mockMath(0.1, 0.5, 0.7)
    const tty = testTTY({
      'Enter a number between 1 & 6: ': ['1'],
      'Enter your name: ': ['John']
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
      '\nGood bye!'
    ])
  })

  it('should encourage user on correct answer', () => {
    const math = mockMath(0.1, 0.5, 0.7)
    const tty = testTTY({
      'Enter a number between 1 & 6: ': ['2'],
      'Enter your name: ': ['John']
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
      '\nGood bye!'
    ])
  })

  it('should continue on pressing enter', () => {
    const math = mockMath(0.1, 0.1, 0.1)
    const tty = testTTY({
      'Enter a number between 1 & 6: ': ['2', '3'],
      'Enter your name: ': ['John'],
      'Press ⏎  to continue (or will exit in 3sec): ': ['', '']
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
      'Enter a number between 1 & 6: '
    ])
  })

  describe('canContinue', () => {
    context('when newline is provided', () => {
      it('should return true', () => {
        const tty = testTTY({
          'Press ⏎  to continue (or will exit in 3sec): ': ['']
        })
        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(canContinue.provide({tty}))

        assert.isTrue(actual)
      })
    })
    context('when no input is provided', () => {
      it('should return false', () => {
        const tty = testTTY({})
        const runtime = testRuntime()
        const actual = runtime.unsafeExecuteSync(canContinue.provide({tty}))

        assert.isFalse(actual)
      })
      it('should output goodbye', () => {
        const tty = testTTY({})
        const runtime = testRuntime()
        runtime.unsafeExecuteSync(canContinue.provide({tty}))

        assert.deepStrictEqual(tty.stdout, [
          'Press ⏎  to continue (or will exit in 3sec): ',
          '\nGood bye!'
        ])
      })
    })
  })
})
