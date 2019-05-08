import {FIO} from '../../'

export interface ConsoleService {
  getStrLn(question: string): Promise<string>
  putStrLn(message: string): void
}

export interface SystemService {
  exit(code?: number): void
}

export interface RandomService {
  random(): number
}

export interface ConsoleEnv {
  console: ConsoleService
}

export interface RandomEnv {
  random: RandomService
}

export interface SystemEnv {
  system: SystemService
}

const MAX_NUMBER = 6
const MIN_NUMBER = 1

const putStrLn = (message: string) =>
  FIO.access((env: ConsoleEnv) => env.console.putStrLn(message))

const getStrLn = (question: string) =>
  FIO.accessP((env: ConsoleEnv) => env.console.getStrLn(question))

const exit = (code?: number) =>
  FIO.access((env: SystemEnv) => env.system.exit(code))

const randomNumber = FIO.access((env: RandomEnv) => env.random.random())

const enterNumber: FIO<ConsoleEnv, Error, number> = getStrLn(
  `Enter a number between ${MIN_NUMBER} & ${MAX_NUMBER}:`
)
  .map(_ => parseInt(_, 10))
  .chain(input =>
    Number.isFinite(input) && input >= MIN_NUMBER && input <= MAX_NUMBER
      ? FIO.of(input)
      : enterNumber
  )

const game: FIO<ConsoleEnv & SystemEnv & RandomEnv, Error, void> = enterNumber
  .zip(
    randomNumber.map(n =>
      Math.floor(MIN_NUMBER + n * (MAX_NUMBER - MIN_NUMBER))
    )
  )
  .chain(([input, random]) =>
    input === random
      ? putStrLn(`You guessed it right!`)
      : putStrLn(`Sorry, the correct answer is ${random}`)
  )
  .and(
    getStrLn('Do you wish to continue? (y/n)').map(
      input => input.toLowerCase() !== 'n'
    )
  )
  .chain(i => (i ? game : putStrLn('Good bye!').and(exit(0))))

export const program = putStrLn('Greetings!')
  .and(getStrLn('Enter your name: '))
  .chain(name =>
    putStrLn(`Welcome to the world of functional programming ${name}`)
  )
  .and(game)
