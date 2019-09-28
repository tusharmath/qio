import {FIO} from '../../../packages/core/lib/main/FIO'
import {FStream} from '../../../packages/core/lib/main/FStream'

import {IMath, ITextTerminal} from './Env'

const MAX_NUMBER = 6
const MIN_NUMBER = 1

/**
 * Takes input from the player through the stdin stream.
 */
const getStrLn = (question: string) =>
  FIO.accessM((_: ITextTerminal) => _.tty.getStrLn(question))

/**
 * Outputs anything passed as arguments to the stdout stream
 */
const putStrLn = (...t: unknown[]) =>
  FIO.accessM((_: ITextTerminal) => _.tty.putStrLn(...t))

/**
 * Generates a random number.
 */
const randomNumber = FIO.access((env: IMath) => env.math.random())

/**
 * Returns a random number within the provide range.
 */
const randomInt = (min: number, max: number) =>
  randomNumber.map(_ => Math.round(_ * (max - min) + min))

/**
 * Keeps taking a numeric input from the player.
 */
const inputNumber = FStream.produce(
  getStrLn(`Enter a number between ${MIN_NUMBER} & ${MAX_NUMBER}: `)
)
  .map(_ => parseInt(_, 10))
  .filter(
    input =>
      Number.isFinite(input) && input >= MIN_NUMBER && input <= MAX_NUMBER
  )

/**
 * Takes the player's name.
 */
const inputName = getStrLn('Enter your name: ').chain(name =>
  putStrLn(`Welcome to the world of functional programming, ${name}!`)
)

/**
 * Checks if the use wants to continue with the game.
 */
export const canContinue = getStrLn(
  'Press ⏎  to continue (or will exit in 3sec): '
)
  .const(true)
  .race(
    putStrLn('\nGood bye!')
      .delay(3000)
      .const(false)
  )

/**
 * Takes an input integer and checks if it matches with a random number.
 */
const checkWithRandom = (guess: number) =>
  randomInt(MIN_NUMBER, MAX_NUMBER).chain(random =>
    guess === random
      ? putStrLn(`You guessed it right!`)
      : putStrLn(`Sorry, the correct answer is ${random}`)
  )

/**
 * Takes in the the player's name and greets them with a message.
 */
const greet = putStrLn('Greetings!').and(inputName)

/**
 * Starts of the game in a loop until the user decides to exit.
 */
const gameLoop = inputNumber
  .mapM(checkWithRandom)
  .forEachWhile(() => canContinue)

export const program = greet.and(gameLoop)
