---
title: Custom Environment
---

By default any QIO instance would not need any env. This can be customized based on what the program needs to perform. For example, if a program needs to read a `config` and print out the `port` set in it one could do something like this —

## Config

Say we already have a `Config` interface, with only one property —

```ts
+ interface Config {
+   port: number
+ }
```

## ConfigEnv

Next we create an Environment that returns a `config` —

```ts
  interface Config {
    port: number
  }
+ interface ConfigEnv {
+   config: Config
+ }
```

## Helper functions

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

## Create program

Using the [chain] operator one can now chain them one after the other —

[chain]: https://tusharmath.com/qio/classes/qio.html#chain

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

[provide]: https://tusharmath.com/qio/classes/qio.html#provide

## Running the program

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

[provide]: https://tusharmath.com/qio/classes/qio.html#provide

## Next Steps

Checkout a fully functional example [here](https://github.com/tusharmath/qio/tree/master/example).
