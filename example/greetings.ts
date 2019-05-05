import {prompt} from 'promptly'

import {DefaultEnv, defaultEnv, FIO} from '../index'

export interface ConsoleService {
  getStrLn(question: string): Promise<string>
  putStrLn(message: string): void
}

export interface SystemService {
  exit(code: number): void
}

export interface RandomService {
  random(): number
}

interface ConsoleEnv {
  console: ConsoleService
}
interface RandomEnv {
  random: RandomService
}
interface SystemEnv {
  system: SystemService
}

const putStrLn = (message: string) =>
  FIO.access((env: ConsoleEnv) => env.console.putStrLn(message))

const getStrLn = (question: string) =>
  FIO.accessP((env: ConsoleEnv) => env.console.getStrLn(question))

const exit = (code: number) =>
  FIO.access((env: SystemEnv) => env.system.exit(code))

const randomNumber = FIO.access((env: RandomEnv) => env.random.random())

const MAX_NUMBER = 6
const MIN_NUMBER = 1

const enterNumber: FIO<DefaultEnv & ConsoleEnv, Error, number> = getStrLn(
  `Enter a number between ${MIN_NUMBER} & ${MAX_NUMBER}:`
)
  .map(_ => parseInt(_, 10))
  .chain(input =>
    Number.isFinite(input) && input >= MIN_NUMBER && input <= MAX_NUMBER
      ? FIO.of(input)
      : enterNumber
  )

const generateRandomInt = randomNumber.map(n =>
  Math.floor(MIN_NUMBER + n * (MAX_NUMBER - MIN_NUMBER))
)

const canContinue = getStrLn('Do you wish to continue? (y/n)').map(
  input => input.toLowerCase() === 'y'
)
const game: FIO<
  DefaultEnv & ConsoleEnv & SystemEnv & RandomEnv,
  Error,
  void
> = enterNumber
  .zip(generateRandomInt)
  .chain(([input, random]) =>
    input === random
      ? putStrLn(`You guessed it right!`)
      : putStrLn(`Sorry, the correct answer is ${random}`)
  )
  .and(canContinue)
  .chain(i => (i ? game : putStrLn('Good bye!')))

const program = putStrLn('Greetings!')
  .and(getStrLn('Enter your name: '))

  .chain(name =>
    putStrLn(`Welcome to the world of functional programming ${name}`)
  )
  .and(game)

const randomS: RandomService = {
  random: () => Math.random()
}

const systemS: SystemService = {
  exit(code: number): void {
    process.exit(code)
  }
}

program.fork({
  ...defaultEnv,
  console: {
    getStrLn: prompt,
    // tslint:disable-next-line:no-console
    putStrLn: (message: string) => console.log(message)
  },
  random: randomS,
  system: systemS
})
