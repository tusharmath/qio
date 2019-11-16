---
title: Benchmarks
---

Comparison is done between [Fluture] and [Bluebird].

[fluture]: https://github.com/fluture-js/Fluture
[bluebird]: https://github.com/petkaantonov/bluebird

## Constant

```
QIO x 2,940,723 ops/sec ±1.03% (79 runs sampled)
Fluture x 162,035 ops/sec ±3.90% (44 runs sampled)
bluebird x 6,126,678 ops/sec ±1.47% (76 runs sampled)
Fastest is bluebird
```

## CreateNestedMap 1000

```
QIO x 9,768 ops/sec ±1.75% (77 runs sampled)
Fluture x 4,136 ops/sec ±1.41% (70 runs sampled)
bluebird x 5,362 ops/sec ±1.17% (77 runs sampled)
Fastest is QIO
```

## Fibonacci: 20

```
Native x 624 ops/sec ±1.67% (90 runs sampled)
QIO x 330 ops/sec ±2.29% (75 runs sampled)
Fluture x 181 ops/sec ±1.66% (78 runs sampled)
bluebird x 154 ops/sec ±1.98% (72 runs sampled)
Fastest is Native
```

## Map

```
QIO x 1,905,466 ops/sec ±1.66% (80 runs sampled)
Fluture x 58,440 ops/sec ±42.61% (38 runs sampled)
bluebird x 2,117,417 ops/sec ±1.07% (80 runs sampled)
Fastest is bluebird
```

## NestedChain 10000

```
QIO x 911 ops/sec ±1.52% (78 runs sampled)
Fluture x 286 ops/sec ±1.29% (62 runs sampled)
bluebird x 535 ops/sec ±1.23% (81 runs sampled)
Fastest is QIO
```

## NestedMap 1000

```
QIO x 9,766 ops/sec ±1.60% (77 runs sampled)
Fluture x 4,230 ops/sec ±1.56% (75 runs sampled)
bluebird x 5,367 ops/sec ±1.59% (76 runs sampled)
Fastest is QIO
```

**Note:** These are micro benchmarks and don't represent a real world scenario. It's possible that in a practical scenario all the above libraries perform similarly.
