---
id: benchmarks
title: Benchmarks
sidebar_label: Benchmarks
---
## Constant
```
QIO x 1,942,269 ops/sec ±4.45% (68 runs sampled)
Fluture x 152,359 ops/sec ±8.25% (50 runs sampled)
bluebird x 4,316,323 ops/sec ±2.13% (76 runs sampled)
Fastest is bluebird
```
## CreateNestedMap 1000
```
QIO x 15,349 ops/sec ±3.05% (76 runs sampled)
## Fibonacci: 20
```
QIO x 517 ops/sec ±1.83% (75 runs sampled)
Fluture x 129 ops/sec ±3.57% (71 runs sampled)
bluebird x 169 ops/sec ±2.55% (73 runs sampled)
Fastest is QIO
```
## Map
```
QIO x 1,405,298 ops/sec ±5.60% (71 runs sampled)
Fluture x 72,885 ops/sec ±12.86% (55 runs sampled)
bluebird x 2,084,296 ops/sec ±2.50% (70 runs sampled)
Fastest is bluebird
```
## NestedChain 10000
```
Matechs x 963 ops/sec ±1.58% (79 runs sampled)
QIO x 1,629 ops/sec ±1.89% (73 runs sampled)
Fluture x 186 ops/sec ±2.12% (73 runs sampled)
