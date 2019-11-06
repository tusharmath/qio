---
title: Referential Transparency
---

Pure functions are referentially transparent. This means in a program the function calls may be replaced by its value (or anything having the same value) without changing the behavior of the program.

This is a powerful guarantee which allows devs to refactor code much more [easily](side-effects).

> This is exactly why QIO was built. **QIO** helps write applications using pure functions. It does this by lifting impure functions into pure ones.
