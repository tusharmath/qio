---
title: Pure Functions
---

In functional programing functions that are **effect-free**, **deterministic** & **total** are called as **pure functions**:

1. **Effect Free:** The function never performs any changes to the outside world (no side-effects).
2. **Deterministic:** Given the same input, the function will always return the same output.
3. **Total:** The function is defined over the complete set of possible input values & doesn't ever throw exceptions or produce an anomaly.

## Referential Transparency

Pure functions are referentially transparent. This means in a program the function calls may be replaced by its value (or anything having the same value) without changing the behavior of the program.

This is a powerful guarantee which allows devs to refactor code much more easily.

---

Continue reading the [tutorial](../core/installation) to understand how QIO can be used to solve these problems.
