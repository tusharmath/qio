import {assert} from 'chai'

import {FIO, UIO} from '../../../src/main/FIO'
import {testRuntime} from '../../../src/runtimes/TestRuntime'
import {canContinue, program} from '../src/Program'

describe('Program', () => {
  /**
   * Mock implementation for everything insde JS's native Math utility
   */
  const MockMath = (...a: number[]) => ({
    random(): number {
      return a.shift() as number
    }
  })

  /**
   * Mock implementation of ITextTerminal
   */
  const MockTTY = (input: {[k: string]: string[]}) => {
    const stdout = new Array<unknown>()

    return {
      getStrLn: (question: string) =>
        FIO.flatten(
          UIO(() => {
            const popped = input.hasOwnProperty(question)
              ? input[question].shift()
              : undefined

            if (popped === undefined) {
              stdout.push(question)

              return FIO.never()
            }

            stdout.push(question + popped)

            return FIO.of(popped)
          })
        ),
      putStrLn: (...t: unknown[]) => UIO(() => void stdout.push(t.join(', '))),
      stdout
    }
  }

  it('should greet', () => {
    const Math = MockMath()
    const tty = MockTTY({})
    testRuntime().executeSync(program.provide({Math, tty}))

    assert.deepStrictEqual(tty.stdout, ['Greetings!', 'Enter your name: '])
  })

  it('should ask user for a number', () => {
    const Math = MockMath()
    const tty = MockTTY({
      'Enter your name: ': ['John']
    })
    testRuntime().executeSync(program.provide({Math, tty}))

    assert.deepStrictEqual(tty.stdout, [
      'Greetings!',
      'Enter your name: John',
      'Welcome to the world of functional programming, John!',
      'Enter a number between 1 & 6: '
    ])
  })

  it('should check match guess with random', () => {
    const Math = MockMath(0.1, 0.5, 0.7)
    const tty = MockTTY({
      'Enter a number between 1 & 6: ': ['1'],
      'Enter your name: ': ['John']
    })
    testRuntime().executeSync(program.provide({Math, tty}))

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
    const Math = MockMath(0.1, 0.5, 0.7)
    const tty = MockTTY({
      'Enter a number between 1 & 6: ': ['2'],
      'Enter your name: ': ['John']
    })
    testRuntime().executeSync(program.provide({Math, tty}))

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
    const Math = MockMath(0.1, 0.1, 0.1)
    const tty = MockTTY({
      'Enter a number between 1 & 6: ': ['2', '3'],
      'Enter your name: ': ['John'],
      'Press ⏎  to continue (or will exit in 3sec): ': ['', '']
    })
    testRuntime().executeSync(program.provide({Math, tty}))

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
        const tty = MockTTY({
          'Press ⏎  to continue (or will exit in 3sec): ': ['']
        })
        const actual = testRuntime().executeSync(canContinue.provide({tty}))

        assert.isTrue(actual)
      })
    })
    context('when no input is provided', () => {
      it('should return false', () => {
        const tty = MockTTY({})
        const actual = testRuntime().executeSync(canContinue.provide({tty}))

        assert.isFalse(actual)
      })
      it('should output goodbye', () => {
        const tty = MockTTY({})
        testRuntime().executeSync(canContinue.provide({tty}))

        assert.deepStrictEqual(tty.stdout, [
          'Press ⏎  to continue (or will exit in 3sec): ',
          '\nGood bye!'
        ])
      })
    })
  })
})