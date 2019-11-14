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

For more complex use cases checkout the [website](https://qio.netlify.com).

## Packages

| Package          | Description                                                            | Version                                               |
| ---------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| **@qio/prelude** | The base library that's used internally by all the QIO based packages. | ![npm](https://img.shields.io/npm/v/@qio/prelude.svg) |
| **@qio/core**    | The core effect management library library.                            | ![npm](https://img.shields.io/npm/v/@qio/core.svg)    |
| **@qio/stream**  | Purely functional streaming capabilities built on top of QIO.          | ![npm](https://img.shields.io/npm/v/@qio/stream.svg)  |
| **@qio/console** | QIO based bindings to read and write to the terminal.                  | ![npm](https://img.shields.io/npm/v/@qio/console.svg) |
| **@qio/http**    | QIO based binding to manage HTTP request/responses safely.             | ![npm](https://img.shields.io/npm/v/@qio/http.svg)    |
| **@qio/fs**      | QIO based binding to manage HTTP request/responses safely.             | ![npm](https://img.shields.io/npm/v/@qio/fs.svg)      |
