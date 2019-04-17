# fearless-io

[![Build Status](https://travis-ci.com/tusharmath/fearless-io.svg?branch=master)](https://travis-ci.com/tusharmath/fearless-io)
![npm](https://img.shields.io/npm/v/fearless-io.svg)

A typesafe functional module that solves practical IO problems on node and the browser.

# Index

- [Installation](#installation)
- [Usage](#usage)
- [Documentation](https://tusharm.com/fearless-io)

## Installation

```bash
npm i fearless-io
```

## Usage

```typescript
import {IO} from 'fearless-io'

// Create a pure version of `console.log` called `putStrLn`
const putStrLn = IO.encase((str: string) => console.log(str))

const hello = putStrLn('Hello World!')

hello.fork(() => {}, () => {})
```
