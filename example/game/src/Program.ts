import {FIO} from '../../..'

export interface IConsole {
  console: {
    getStrLn(question: string): Promise<string>
    putStrLn(message: string): void
  }
}

export interface IRandom {
  random: {
    random(): number
  }
}

export interface ISystem {
  system: {
    exit(code?: number): void
  }
}

const MAX_NUMBER = 6
const MIN_NUMBER = 1

const putStrLn = (message: string) =>
  FIO.access((env: IConsole) => env.console.putStrLn(message))

const getStrLn = (question: string) =>
  FIO.flatten(
    FIO.access(FIO.encaseP((env: IConsole) => env.console.getStrLn(question)))
  )

const exit = (code?: number) =>
  FIO.access((env: ISystem) => env.system.exit(code))

const randomNumber = FIO.access((env: IRandom) => env.random.random())

const enterNumber: FIO<unknown, number, IConsole> = getStrLn(
  `Enter a number between ${MIN_NUMBER} & ${MAX_NUMBER}:`
)
  .map(_ => parseInt(_, 10))
  .chain(input =>
    FIO.if(
      Number.isFinite(input) && input >= MIN_NUMBER && input <= MAX_NUMBER,
      FIO.of(input),
      enterNumber
    )
  )

const game: FIO<unknown, void, IConsole & IRandom & ISystem> = enterNumber
  .zip(
    randomNumber.map(n =>
      Math.floor(MIN_NUMBER + n * (MAX_NUMBER - MIN_NUMBER))
    )
  )
  .chain(({0: input, 1: random}) =>
    input === random
      ? putStrLn(`You guessed it right!`)
      : putStrLn(`Sorry, the correct answer is ${random}`)
  )
  .and(
    getStrLn('Do you wish to continue? (y/n)').map(
      input => input.toLowerCase() !== 'n'
    )
  )
  .chain(i => FIO.if(i, game, putStrLn('Good bye!').and(exit(0))))

export const program = putStrLn('Greetings!')
  .and(getStrLn('Enter your name: '))
  .chain(name =>
    putStrLn(`Welcome to the world of functional programming ${name}`)
  )
  .and(game)
