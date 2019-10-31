---
title: Usage
sidebar_label: Usage
---

## Creating a QIO

There are multiple ways through which you can create an instance of QIO. Refer to the [API documentation] to learn about all the ways.

[api documentation]: api/classes/qio.md

Once of the easiest ways to create a QIO is through [QIO.encase].

[qio.encase]: api/classes/qio.md#encase

```ts
+ import {QIO} from '@qio/core'
+
+ const Greet = () => console.log('Hello World!')
+ const GreetIO = QIO.encase(Greet)
```

Calling `GreetIO()` returns a pure data structure which represents a side-effect, that —

1. Can execute in any environment without any special needs.
2. Never fails.
3. Resolves with a `void`.

## Executing QIO

Execution of QIO happens through a [Runtime].

[runtime]: api/classes/runtime.html

```ts
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'

  const Greet = () => console.log('Hello World!')
  const GreetIO = QIO.encase(Greet)
+ defaultRuntime().unsafeExecute(GreetIO())
```

## Serial Execution

Since these data structures don't specify how or when they are going to be executed, writing them one after the other in procedural style will not guarantee any order of execution, for Eg —

```ts
+  import {QIO} from '@qio/core'
+  const putStrLn = QIO.encase((msg: string) => console.log(msg))
+
+  const foo = putStrLn('foo')
+  const bar = putStrLn('bar')
```

In the above code either `foo` or `bar` can be printed first depending on internal prioritization and scheduling algorithms that QIO uses. To ensure that `foo` is printed first and `bar` is printed second one must use the [and] operator.

```ts
  import {QIO} from '@qio/core'
  const putStrLn = QIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

+ const fooBar = fooIO.and(barIO)
```

`fooBar` is a new QIO object of type `QIO<unknown, never, void>`.

```ts
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'
  const putStrLn = QIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

  const fooBar = fooIO.and(barIO)
+ defaultRuntime().unsafeExecute(fooBar)
```

[and]: api/classes/qio.md#and

## Parallel Execution

Similar to the `and` operator, the [par] operator runs the two IOs in parallel. For eg.

[par]: api/classes/qio.md#par

Create the two IOs

```ts
+  import {QIO} from '@qio/core'
+
+  const foo = QIO.timeout('foo', 1000)
+  const bar = QIO.timeout('bar', 1500)
```

Combine them using [par]

```ts
- import {QIO} from '@qio/core'

  const foo = QIO.timeout('foo', 1000)
  const bar = QIO.timeout('bar', 1500)
+ const fooBar = foo.par(bar)
```

Execute the created IO

```ts
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'

  const foo = QIO.timeout('foo', 1000)
  const bar = QIO.timeout('bar', 1500)
  const fooBar = foo.zip(bar)

+ defaultRuntime().unsafeExecute(fooBar)
```

The program `fooBar` will complete in `1500`ms because both are executed in parallel.

Other more powerful operators can be found at [API Documentation].

[api documentation]: api/classes/qio.md

## Cancellation

Executing an IO returns a cancel callback. Essentially a function that when called, aborts the IO from any further execution and synchronously releases all the acquired resources.

Create an IO

```ts
+ import {QIO} from '@qio/core'
+ const delayIO = QIO.timeout('Hello World', 1000)
```

Execute by passing it to `defaultRuntime`

```ts
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'
  const delayIO = QIO.timeout('Hello World', 1000)
+ const cancel = defaultRuntime().unsafeExecute(delayIO)
```

Calling the cancelling callback.

```ts
import {QIO, defaultRuntime} from '@qio/core'
const delayIO = QIO.timeout('Hello World', 1000)
const cancel = defaultRuntime().execute(delayIO) + cancel()
```

As soon as `cancel` is called internally the timeout is cancelled.

## Custom Environment

By default any QIO instance would not need any env. This can be customized based on what the program needs to perform. For example, if a program needs to read a `config` and print out the `port` set in it one could do something like this —

### Config

Say we already have a `Config` interface, with only one property —

```ts
+ interface Config {
+   port: number
+ }
```

### ConfigEnv

Next we create an Environment that returns a `config` —

```ts
  interface Config {
    port: number
  }
+ interface ConfigEnv {
+   config: Config
+ }
```

### Helper functions

We add `getPort` which picks the `port` and `putStrLn` which is a wrapper over `console.log` to make it pure.

```ts
+ import {QIO} from '@qio/core'
  interface Config {
    port: number
  }
  interface ConfigEnv {
    config: Config
  }
+ const getPort = QIO.access((config: Config) => config.port)
+ const putStrLn = QIO.encase((message: string) => console.log(message))
```

### Create program

Using the [chain] operator one can now chain them one after the other —

[chain]: api/classes/qio.md#chain

```ts
  import {QIO} from '@qio/core'
  interface Config {
    port: number
  }
  interface ConfigEnv {
    config: Config
  }
  const getPort = QIO.access((config: Config) => config.port)
  const putStrLn = QIO.encase((message: string) => console.log(message))

+ const program = getPort().chain(putStrLn)
```

### Provide Env

You can provide the env directly to a QIO instance without executing it using the [provide] method.

```ts
  import {QIO} from '@qio/core'
+ import config from 'node-config'
  interface Config {
    port: number
  }
  interface ConfigEnv {
    config: Config
  }
  const getPort = QIO.access((config: Config) => config.port)
  const putStrLn = QIO.encase((message: string) => console.log(message))

  const program = getPort().chain(putStrLn)

+ const env = {
+   config: config
+ }
+ const program0 = program.provide(env)
```

[provide]: api/classes/qio.md#provide

### Running the program

Running the program can be done by using the runtime.

```ts
- import {QIO} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'
  import config from 'node-config'
  interface Config {
    port: number
  }
  interface ConfigEnv {
    config: Config
  }
  const getPort = QIO.access((config: Config) => config.port)
  const putStrLn = QIO.encase((message: string) => console.log(message))

  const program = getPort().chain(putStrLn)

  const env = {
    config: config
  }
  const program0 = program.provide(env)
+ defaultRuntime().unsafeExecute(program0)
```

[provide]: api/classes/qio.md#provide

### Next Steps

Checkout a fully functional example [here](https://github.com/tusharmath/qio/tree/master/packages/example).
