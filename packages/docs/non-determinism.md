---
title: Non Determinism
---

Another typical problem that a real world program needs to deal with is non-determinism. Consider a program that reads a user's account balance from the database and prints it on the screen. If anyone changes the user's account balance later in time, running program again would print the updated balance.

This is non-determinism and is typically caused when your program tries to read a globally mutable state. Such non-deterministic programs can induce race conditions very easily and deter developers from using any form of memoization.

Now consider a simple multiplication function, passing the same two numbers as input will always return the same result. Such a function is going to be deterministic, hence it's not affected by concurrent execution and is easily memoizable.

```ts
const mul = (a: number, b: number): number => a * b