[![Build Status](https://travis-ci.com/tusharmath/fearless-io.svg?branch=master)](https://travis-ci.com/tusharmath/fearless-io)
![npm](https://img.shields.io/npm/v/fearless-io.svg)

A type-safe, functional, performant, lawful, composable data structure that solves practical problems of effect-full code in node and browser.

# Index

- [Installation](#installation)
- [Usage](#usage)
- [Getting Started](#getting-started)
- [Documentation](https://tusharmath.com/fearless-io)
- [Example](https://github.com/tusharmath/fearless-io/blob/master/example/README.md)
- [Benchmarks](https://github.com/tusharmath/fearless-io/blob/master/benchmarks/README.md)
- [Credits](#credits)

[getting started]: https://github.com/tusharmath/fearless-io/blob/master/GETTING_STARTED.md

# Installation

```bash
npm i fearless-io
```

# Usage

```typescript
import {IO, defaultRuntime} from 'fearless-io'

// Create a pure version of `console.log` called `putStrLn`
const putStrLn = IO.encase((str: string) => console.log(str))

const hello = putStrLn('Hello World!')

const runtime = defaultRuntime()
runtime.unsafeExecute(hello)
```

# Getting Started

## Type Signature

```ts
interface FIO<R, E, A> {
  // ... Operators
}
```

`FIO` takes in three type params viz. —

1. `R` Represents the type of environment needed to execute this IO ([more](#custom-environment)).
2. `E` The error types that can be emitted while this IO is executing.
3. `A` The type of the success value that will be emitted by the IO on completion.

Using these three type params you can fairly represent any side-effect. For example lets say there is function `Greet` which simply prints "Hello World" —

```diff
  const Greet = () => console.log('Hello World!')
```

To represent `Greet` —

1. `R` could be `unknown`: since `console.log` works everywhere.
2. `E` could be `never`: Printing anything on console never fails.
3. `A` could be `void`: The output of running the program is basically nothing.

```ts
const GreetIO: FIO<unknown, never, void>
```

# Creating a FIO

There are multiple ways through which you can create an instance of FIO viz. `FIO.from` or `FIO.encase` etc. Refer to the [API documentation] to learn about all the ways.

[api documentation]: https://tusharmath.com/fearless-io/classes/fio.html

Once of the easiest ways to create a FIO is through [FIO.encase].

[fio.encase]: https://tusharmath.com/fearless-io/classes/fio.html#encase

```patch
+ import {FIO} from 'fearless-io'

  const Greet = () => console.log('Hello World!')
+ const GreetIO = FIO.encase(Greet)
```

Calling `GreetIO()` returns a pure data structure which represents a side-effect, that —

1. Can execute in any environment without any special needs.
2. Never fails.
3. Resolves with a `void`.

# Executing FIO

Execution of FIO happens through a [Runtime].

[runtime]: https://tusharmath.com/fearless-io/classes/runtime.html

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultRuntime} from 'fearless-io'

  const Greet = () => console.log('Hello World!')
  const GreetIO = FIO.encase(Greet)
+ defaultRuntime().unsafeExecute(GreetIO())
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

In the above code either `foo` or `bar` can be printed first depending on internal prioritization and scheduling algorithms that FIO uses. To ensure that `foo` is printed first and `bar` is printed second one must use the [and] operator.

```diff
  import {FIO} from 'fearless-io'
  const putStrLn = FIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

+ const fooBar = fooIO.and(barIO)
```

`fooBar` is a new FIO object of type `FIO<unknown, never, void>`.

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultRuntime} from 'fearless-io'
  const putStrLn = FIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

  const fooBar = fooIO.and(barIO)
+ defaultRuntime().unsafeExecute(fooBar)
```

[and]: https://tusharmath.com/fearless-io/classes/fio.html#and

# Parallel Execution

Similar to the `and` operator, the [par] operator runs the two IOs in parallel. For eg.

[par]: https://tusharmath.com/fearless-io/classes/fio.html#par

Create the two IOs

```diff
+  import {FIO} from 'fearless-io'
+
+  const foo = FIO.timeout('foo', 1000)
+  const bar = FIO.timeout('bar', 1500)
```

Combine them using [par]

```diff
- import {FIO} from 'fearless-io'

  const foo = FIO.timeout('foo', 1000)
  const bar = FIO.timeout('bar', 1500)
+ const fooBar = foo.par(bar)
```

Execute the created IO

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultRuntime} from 'fearless-io'

  const foo = FIO.timeout('foo', 1000)
  const bar = FIO.timeout('bar', 1500)
  const fooBar = foo.zip(bar)

+ defaultRuntime().unsafeExecute(fooBar)
```

The program `fooBar` will complete in `1500`ms because both are executed in parallel.

Other more powerful operators can be found at [API Documentation].

[api documentation]: https://tusharmath.com/fearless-io/classes/fio.html

# Cancellation

Executing an IO returns a cancel callback. Essentially a function that when called, aborts the IO from any further execution and synchronously releases all the acquired resources.

Create an IO

```diff
+ import {FIO} from 'fearless-io'
+ const delayIO = FIO.timeout('Hello World', 1000)
```

Execute by passing it to `defaultRuntime`

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultRuntime} from 'fearless-io'
  const delayIO = FIO.timeout('Hello World', 1000)
+ const cancel = defaultRuntime().unsafeExecute(delayIO)
```

Calling the cancelling callback.

```diff
  import {FIO, defaultRuntime} from 'fearless-io'
  const delayIO = FIO.timeout('Hello World', 1000)
  const cancel = delayIO.fork(defaultRuntime)
+ cancel()
```

As soon as `cancel` is called internally the timeout is cancelled.

# Custom Environment

By default any FIO instance would not need any env. This can be customized based on what the program needs to perform. For example, if a program needs to read a `config` and print out the `port` set in it one could do something like this —

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

## Provide Env

You can provide the env directly to a FIO instance without executing it using the [provide] method.

```diff
  import {FIO} from 'fearless-io'
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
+   config: config
+ }
+ const program0 = program.provide(env)
```

[provide]: https://tusharmath.com/fearless-io/classes/fio.html#provide

## Running the program

Running the program can be done by using the runtime.

```diff
- import {FIO} from 'fearless-io'
+ import {FIO, defaultRuntime} from 'fearless-io'
  import config from 'node-config'
  interface Config {
    port: number
  }
  interface ConfigEnv {
    config: Config
  }
  const getPort = FIO.access((config: Config) => config.port)
  const putStrLn = FIO.encase((message: string) => console.log(message))

  const program = getPort().chain(putStrLn)

  const env = {
    config: config
  }
  const program0 = program.provide(env)
+ defaultRuntime().unsafeExecute(program0)
```

[provide]: https://tusharmath.com/fearless-io/classes/fio.html#provide

## Next Steps

Checkout a fully functional example [here](https://github.com/tusharmath/fearless-io/tree/master/example).

# Credits

FIO is heavily inspired by the following libraries —

- [Scala ZIO](https://github.com/zio/zio)
- [Fluture](https://github.com/fluture-js/Fluture)
