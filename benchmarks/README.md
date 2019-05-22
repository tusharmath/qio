# Benchmarks

## Constant

```bash
node benchmarks/Constant.js
FIO x 5,198,228 ops/sec ±4.29% (74 runs sampled)
Fluture x 94,217 ops/sec ±52.23% (61 runs sampled)
Fastest is FIO
```

## Map

```bash
node benchmarks/Map.js
FIO x 3,584,914 ops/sec ±2.58% (73 runs sampled)
Fluture x 99,960 ops/sec ±7.91% (48 runs sampled)
Fastest is FIO
```

## NestedMaps

```bash
node benchmarks/NestedMap.js
FIO2 x 11,394 ops/sec ±2.38% (91 runs sampled)
FIO x 6,865 ops/sec ±2.09% (74 runs sampled)
Fluture x 8,856 ops/sec ±1.42% (82 runs sampled)
Fastest is FIO2
```

## NestedChains

```bash
node benchmarks/NestedChain.js
FIO2 x 1,080 ops/sec ±3.93% (93 runs sampled)
FIO x 355 ops/sec ±1.45% (79 runs sampled)
Fluture x 857 ops/sec ±1.60% (77 runs sampled)
Fastest is FIO2
```