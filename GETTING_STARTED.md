# Getting Started

Fearless IO (FIO) can encapsulate a side-effect causing code into a pure, functional lawful and type-safe data structure. This data structure can be used as a representation of the effect essentially as a value, without actually performing that effect. It makes code much easier to refactor and test. We will learn more about how you can exploit this behavior in FIO.

# FIO Signature

## Type Parameters

```diff
interface FIO<R, E, A> {
}
```

`FIO` takes in three type params viz. —

1. `R` Represents the type of environment needed to execute this IO (more on this later).
2. `E` The error types that can be thrown while this IO is executing.
3. `A` The type of the success value that will be emitted by the IO on completion.

Using these three type params you can fairly represent any side-effect. For example lets say there is function `Greet` which simply prints "Hello World" —

```diff
const Greet = () => console.log('Hello World!')
```

To represent `Greet` we could use —

1. `console.log` works everywhere so `R` could be any environment.
2. Printing anything on console barley ever fails so `E` could be of `never` type.
3. The output of running the program is basically nothing so `A` could be of `void` type.

```diff
import {DefaultEnv} from 'fearless-IO'

const GreetIO: FIO<DefaultEnv, never, void>
```

[defaultenv]: https://tusharmath.com/fearless-io/interfaces/defaultenv

This is a simple "type" based representation of the side-effect. It hides inner details about how its implemented or when is it going to get executed.
[DefaultEnv] is a special env which signals that the default env is enough to run the program.

## Forking

The interface also contains a `fork` method that actually executes the side-effect.

```diff
  interface FIO<R, E, A> {
+   fork(env: R, onError: (e: E) => void, onSuccess: (a: A) => void): Cancel
  }
```

Fork utlizies the three type params viz `R`, `E` & `A` as follows —

- `R` Is the first param and is used to inject the environment to the IO.
- `E` Is used in the `onError` callback to handle exceptions in a type-safe manner.
- `A` Is used in the `onSuccess` callback to handle the resolved values, also in a type-safe manner.

The return type of fork is a [cancel](#cancellation) function. This is used to stop the side-effect from executing any further and release all the acquired resources.

## Final Interface

```ts
interface FIO<R, E, A> {
  fork(env: R, onError: (e: E) => void, onSuccess: (a: A) => void): Cancel
}
```

# Creating a FIO

There are multiple ways through which you can create an instance of FIO viz. `FIO.from` or `FIO.encase` etc. Refer to the [API documentation] to learn other ways.

[api documentation]: https://tusharmath.com/fearless-io/classes/fio.html

Once of the easiest ways to create a FIO is through [FIO.encase].

[fio.encase]: https://tusharmath.com/fearless-io/classes/fio.html#encase

```patch
+ import {FIO} from 'fearless-io'

  const Greet = () => console.log('Hello World!')

+ const GreetIO = FIO.encase(Greet)
```

Calling `GreetIO()` returns a pure data structure which represents a side-effect causing hunk-of-code, that —

1. Can execute in [DefaultEnv] without any special needs.
2. Never fails.
3. Resolves with a `void`.

# Executing FIO

Execution of FIO happens when you call the `fork` method on it.

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultEnv} from 'fearless-io'

  const Greet = () => console.log('Hello World!')
  const GreetIO = FIO.encase(Greet)

- GreetIO()
+ GreetIO().fork(defaultEnv)
```

The `fork` method needs `env` as a required param. The other two params are `onError` and `onSuccess` callbacks which are optional.

```diff
  import {FIO} from 'fearless-io'
  import {FIO, defaultEnv} from 'fearless-io'

  const Greet = () => console.log('Hello World!')
  const GreetIO = FIO.encase(Greet)

+ // Callback to handle errors
+ onError = (err: Error) => {
+   console.log(err.message)
+   process.exit(1)
+ }

+ // Callback to handle success
+ onSuccess = () => {
+   process.exit(0)
+ }


- GreetIO().fork(defaultEnv)
+ GreetIO().fork(defaultEnv, onError, onSuccess)
```

# Serial Execution

Since these data structures don't specify how or when they are going to be executed, writing them one after the other in procedural style will not guarantee any order of execution, for Eg —

```diff
+  import {FIO} from 'fearless-io'
+  const putStrLn = FIO.encase((msg: string) => console.log(msg))
+
+  const foo = putStrLn('foo')
+  const bar = putStrLn('bar')
```

In the above code either `foo` or `bar` can be printed first depending on internal prioritization and scheduling algorithms that FIO uses. To ensure that `foo` is printed first and `bar` is printed second one must use the `and` operator.

```diff
  import {FIO} from 'fearless-io'
  const putStrLn = FIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

+ const fooBar = fooIO.and(barIO)
```

`fooBar` is a new FIO object of type `FIO<DefaultEnv, never, void>`. To execute them one after the other you can now call `fork` on it.

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultEnv} from 'fearless-io'
  const putStrLn = FIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

  const fooBar = fooIO.and(barIO)
+ fooBar.fork(defaultEnv)
```

# Parallel Execution

Similar to the `and` operator, the `zip` operator runs the two IOs in parallel. For eg.

Create the two IOs

```diff
+  import {FIO} from 'fearless-io'
+
+  const foo = FIO.timeout('foo', 1000)
+  const bar = FIO.timeout('bar', 1500)
```

Combine them using zip

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultEnv} from 'fearless-io'

  const foo = FIO.timeout('foo', 1000)
  const bar = FIO.timeout('bar', 1500)
+ const fooBar = foo.zip(bar)
```

Fork the created IO

```diff
  import {FIO} from 'fearless-io'
  import {FIO, defaultEnv} from 'fearless-io'

  const foo = FIO.timeout('foo', 1000)
  const bar = FIO.timeout('bar', 1500)
  const fooBar = foo.zip(bar)
+ fooBar.fork(defaultEnv)
```

Other more powerful operators can be found at [API Documentation].

[api documentation]: https://tusharmath.com/fearless-io/classes/fio.html

# Cancellation

Forking an IO returns a cancel callback. Essentially a function that when called, aborts the IO from any further execution and synchronously releases all the acquired resources.

Create an IO

```diff
+ import {FIO} from 'fearless-io'
+ const delayIO = FIO.timeout('Hello World', 1000)
```

Fork it by passing `defaultEnv`

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultEnv} from 'fearless-io'
  const delayIO = FIO.timeout('Hello World', 1000)
+ const cancel = delayIO.fork(defaultEnv)
```

Calling the cancelling callback.

```diff
  import {FIO, defaultEnv} from 'fearless-io'
  const delayIO = FIO.timeout('Hello World', 1000)
  const cancel = delayIO.fork(defaultEnv)
+ cancel()
```

As soon as `cancel` is called internally the timeout is cancelled.

# Custom Environment

By default any FIO instance would always need the [DefaultEnv]. This can be customized based on what the program needs to perform. For example, if a program needs to read a `config` and print out the `port` set in it one could do something like this —

[defaultenv]: https://tusharmath.com/fearless-io/interfaces/defaultenv.html

## Config

Say we already have a `Config` interface, with only one property —

```diff
+ interface Config {
+   port: number
+ }
```

## ConfigEnv

Next we create an Environment that returns a `config` —

```diff
  interface Config {
    port: number
  }
+ interface ConfigEnv {
+   config: Config
+ }
```

## Helper functions

We add `getPort` which picks the `port` and `putStrLn` which is a wrapper over `console.log` to make it pure.

```diff
+ import {FIO} from 'fearless-io'
  interface Config {
    port: number
  }
  interface ConfigEnv {
    config: Config
  }
+ const getPort = FIO.access((config: Config) => config.port)
+ const putStrLn = FIO.encase((message: string) => console.log(message))
```

## Create program

Using the [chain] operator one can now chain them one after the other —

[chain]: https://tusharmath.com/fearless-io/classes/fio.html#chain

```diff
  import {FIO} from 'fearless-io'
  interface Config {
    port: number
  }
  interface ConfigEnv {
    config: Config
  }
  const getPort = FIO.access((config: Config) => config.port)
  const putStrLn = FIO.encase((message: string) => console.log(message))

+ const program = getPort().chain(putStrLn)
```

## Running the program

Running the program can be done by calling `fork` with the env.

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultEnv} from 'fearless-io'
+ import config from 'node-config'
  interface Config {
    port: number
  }
  interface ConfigEnv {
    config: Config
  }
  const getPort = FIO.access((config: Config) => config.port)
  const putStrLn = FIO.encase((message: string) => console.log(message))

  const program = getPort().chain(putStrLn)

+ const env = {
+   config: config,
+   ...defaultEnv()
+ }
+ program.fork(env)
```

## Next

Checkout a fully functional example [here](https://github.com/tusharmath/fearless-io/tree/master/example).
