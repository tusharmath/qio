---
title: Introduction
---

A _real world_ program needs to deal with **side-effects**, **non determinism** and **exceptions & anomalies**. QIO aims to solve these problems elegantly.

## Side effects

Side effects are changes that your program performs to the outside world, for eg.:

1. Writing to a database.
2. Taking input from a user.
3. Making an HTTP call.
4. Render an image on a screen etc.

A program that performs no side-effects has no practical usage. For eg. a program that multiplies two numbers and simply holds the result is pretty much useless, unless the numbers are inputted by the user and the output is printed on the screen.

## Non-determinism

Another typical problem that a real world program needs to deal with is non-determinism. Consider a program that reads a user's account balance from the database and prints it on the screen. If anyone changes the user's account balance later in time, running program again would print the updated balance.

This is non-determinism and is typically caused when your program tries to read a globally mutable state. Such non-deterministic programs can induce race conditions very easily and deter developers from using any form of memoization techniques.

Now consider a simple multiplication function, passing the same two numbers as input will always return the same result. Such a function is going to be deterministic, hence it's not affected by concurrent execution and is easily memoizable.

```ts
const mul = (a: number, b: number): number => a * b
```

## Exceptions & Anomalies

Consider a simple deterministic function such as `div` that takes in two numbers and returns the result by dividing one over the other:

```ts
const div = (a: number, b: number): number => a / b
```

If you observe closely you will see a problem with `div`. The function `div` is defined over a limited set of values for `b`. Passing `b` as `0` will return `Infinity` which is technically not a `number` thus producing an anomaly in the program at runtime. Ideally you would like to handle the above problem at compile time.

The above three problems are common to most real world programs and unfortunately Javascript doesn't provide us with a first class support to handle them. **QIO** provides solid abstractions that can help solve these problems elegantly.
