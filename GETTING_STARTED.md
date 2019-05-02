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

- `R` Is the first param and is used to inject the environement to the IO.
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

Once of the easiest ways to create a ZIO is through [ZIO.encase].

[zio.encase]: https://tusharmath.com/fearless-io/classes/fio.html#encase

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

+ // Callback to handle errors
+ onError = (err: Error) => {
+   console.log(err.message)
+   process.exit(1)
+ }

+ // Callback to handle success
+ onSuccess = () => {
+   process.exit(0)
+ }


- GreetIO()
+ GreetIO().fork(defaultEnv, onError, onSuccess)
```

The `fork` method takes in three arguments —

1. Environment needed for the IO to execute.
2. The on failure callback which is called with the error
3. The on success callback

# Cancellation

Forking an IO returns a cancel callback. Essentially a function that when called, aborts the IO from any further execution and synchronously releases all the acquired resources.

```ts
import {FIO, defaultEnv} from 'fearless-io'

const delayIO = FIO.timeout('Hello World', 1000)

const cancel = delayIO.fork(defaultEnv, onError, onSuccess)

cancel()
```

# Composing FIO

Since these data structures don't specify how or when they are going to be executed, writing them one after the other in procedural style will not guarantee any order of execution, for Eg —

```diff
+  import {FIO} from 'fearless-io'
+  const putStrLn = FIO.encase((msg: string) => console.log(msg))
+
+  const fooIO = putStrLn('foo')
+  const barIO = putStrLn('bar')
```

In the above code either `foo` or `bar` can be printed first depending on internal prioritization and scheduling algorithms. To ensure that `foo` is printed first and `bar` is printed second one must use the `chain` operator.

```diff
  import {FIO} from 'fearless-io'
  const putStrLn = FIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

+ const fooBar = fooIO.chain(() => barIO)
```

`fooBar` is a new ZIO object of type `ZIO<DefaultEnv, never, void>`. To execute them one after the other you can now call `fork` on it.

```diff
  import {FIO} from 'fearless-io'
  const putStrLn = FIO.encase((msg: string) => console.log(msg))

  const fooIO = putStrLn('foo')
  const barIO = putStrLn('bar')

  const fooBar = fooIO.chain(() => barIO)
+ fooBar.fork(defaultEnv)
```
