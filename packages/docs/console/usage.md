---
title: Usage
---

`@qio/console` provides a list of testable console utilities such as `getStrLn` and `putStrLn` that abstract out the dependency on `stdin` and `stdout` streams.

`console.log` is a function that causes a side-effect which printing on the screen. One easy way to convert it to a functional effect is by using `QIO.encase`

```ts
import {QIO} from '@qio/core'
const putStrLn = QIO.encase(console.log)
```

`@qio/console` can actually help remove this boilerplate code by exporting `putStrLn` directly for consumption.

## Printing on the screen

The following `program` would simply print `Welcome` on the screen.

```diff
+ import {putStrLn} from '@qio/console'
+
+ const program = putStrLn('Welcome')
```

## Taking user input

User input can be taken using `getStrLn`.

```diff
- import {putStrLn} from '@qio/console'
+ import {putStrLn, getStrLn} from '@qio/console'

- const program = putStrLn('Welcome')
+ const program = getStrLn('Enter name: ')
+  .chain(name => putStrLn('Welcome', name))
```

## Environment Requirements

By default `getStrLn` and `putStrLn` have a dependency on `ITextTerminalEnv`. Because of this dependency, the `program` is of type: `QIO<void, never, ITextTerminalEnv>`.

The default env is shipped with `@qio/console` and can be used as:

```diff
- import {putStrLn, getStrLn} from '@qio/console'
+ import {putStrLn, getStrLn, TTY} from '@qio/console'

  const program = getStrLn('Enter name: ')
   .chain(name => putStrLn('Welcome', name))
+  .provide({tty: TTY})
```

## Running the program

```diff
  import {putStrLn, getStrLn, TTY} from '@qio/console'
+ import {defaultRuntime} from '@qio/core'

  const program = getStrLn('Enter name: ')
   .chain(name => putStrLn('Welcome', name))
   .provide({tty: TTY})

+ defaultRuntime().unsafeExecute(program)
```

`program` can be executed like any other `QIO` using `defaultRuntime`.

## Using Test Env

`QIO` allows passing of mock `ITextTerminalEnv`.

```diff
- import {putStrLn, getStrLn, TTY} from '@qio/console'
+ import {putStrLn, getStrLn, TTY, testTTY} from '@qio/console'
- import {defaultRuntime} from '@qio/core'

+ const testTTYEnv = testTTY()
  const program = getStrLn('Enter name: ')
   .chain(name => putStrLn('Welcome', name))
-  .provide({tty: TTY})
+  .provide({tty: testTTYEnv})

  defaultRuntime().unsafeExecute(program)
```

## Add mock input

Mock responses can be added using `testTTY()`:

```diff
  import {putStrLn, getStrLn, TTY, testTTY} from '@qio/console'
- import {defaultRuntime} from '@qio/core'
+ import {QIO, defaultRuntime} from '@qio/core'

+ const mockInput = {
+   'Enter name: ': QIO.resolve('Bob')
+ }
+
- const testTTYEnv = testTTY()
+ const testTTYEnv = testTTY(mockInput)
  const program = getStrLn('Enter name: ')
   .chain(name => putStrLn('Welcome', name))
   .provide({tty: testTTYEnv})

  defaultRuntime().unsafeExecute(program)
```

Running the program will automatically input `Bob` when the name is asked for.

## Using Test Runtime

Replacing the `defaultRuntime` with `testRuntime` will allow synchronous running of the program:

```diff
  import {putStrLn, getStrLn, TTY, testTTY} from '@qio/console'
- import {QIO, defaultRuntime} from '@qio/core'
+ import {QIO, testRuntime} from '@qio/core'
+ import * as assert from 'assert'

  const mockInput = {
    'Enter name: ': QIO.resolve('Bob')
  }

  const testTTYEnv = testTTY(mockInput)
  const program = getStrLn('Enter name: ')
   .chain(name => putStrLn('Welcome', name))
   .provide({tty: testTTYEnv})

- defaultRuntime().unsafeExecute(program)
- testRuntime().unsafeExecuteSync(program)
+
+ const actual = testTTYEnv.stdout
+ const expected = [
+  'Enter name: Bob',
+  'Welcome Bob'
+ ]
+ assert.deepStrictEqual(actual, expected)
```

The `stdout` property is only available in the env created by `testEnv`. This is used mainly to assert what's being outputted on the screen.
