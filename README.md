[![Build Status](https://travis-ci.com/tusharmath/qio.svg?branch=master)](https://travis-ci.com/tusharmath/qio)
![npm](https://img.shields.io/npm/v/@qio/core.svg)

A type-safe, functional, performant, lawful, composable data structure that solves practical problems of effect-full code in node and browser.

## Usage

```ts
import {QIO, defaultRuntime} from '@qio/core'

const putStrLn = QIO.encase(console.log)

const program = putStrLn('Hello World')

defaultRuntime().unsafeExecute(program)
```

For more complex use cases checkout the [website](https://tusharmath.com/qio/web/).