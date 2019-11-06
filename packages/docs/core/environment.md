---
title: Environment
---

By default any QIO instance would not need any env. This can be customized based on what the program needs to perform. For example, if a program needs to read a `config` and print out the `port` it could do something like this:

## Config

Say we already have a `Config` interface, with only one property —

```ts
+ interface Config {
+   port: number
+ }
```

## ConfigEnv

Create an Environment that returns an instance of `Config`

```ts
  interface Config {
    port: number
  }
+
+ interface ConfigEnv {
+   config: Config
+ }
```

## getPort()

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
+ const putStrLn = QIO.encase(console)
```

## Create program

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

## Provide Env

You can provide the env directly to a QIO instance without executing it using the [provide] method.

```ts
  import {QIO} from '@qio/core'
+
+ import config from './config'
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

  import config from 'config'
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
