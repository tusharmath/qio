import {FIO} from '../../../src/main/FIO'
import {FStream} from '../../../src/main/FStream'
import {Managed} from '../../../src/main/Managed'

import {IConsole, IMath, IProcess, IReadLine} from './Env'

const MAX_NUMBER = 6
const MIN_NUMBER = 1

/**
 * Prints out the content string on stdout stream.
 */
const putStrLn = (message: string) =>
  FIO.access((env: IConsole) => env.console.log(message))

/**
 * Creates a managed ReadLine interface using std in/out
 */
const rlInterface = Managed.make(
  FIO.access((_: IProcess) => _.process).chain(process =>
    FIO.access((_: IReadLine) =>
      _.readline.createInterface(process.stdin, process.stdout)
    )
  ),
  FIO.encase(rl => rl.close())
)

/**
 * Takes input from the player through the stdin stream.
 */
const getStrLn = (question: string) =>
  rlInterface.use(rl => FIO.cb<string>(cb => rl.question(question, cb)))

/**
 * Generates a random number.
 */
const randomNumber = FIO.access((env: IMath) => env.Math.random())

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
  putStrLn(`Welcome to the world of functional programming, ${name}`)
)

/**
 * Checks if the use wants to continue with the game.
 */
const canContinue = getStrLn('Press ⏎  to continue (or will exit in 3sec): ')
  .const(true)
  .race(FIO.timeout(false, 3000).do(putStrLn('\nGood bye!')))

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
  .mapM(() => canContinue)
  .forEachWhile(FIO.of)

export const program = greet.and(gameLoop)
