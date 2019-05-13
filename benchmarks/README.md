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
Fluture x 8,201 ops/sec ±1.50% (73 runs sampled)
FIO x 2,654 ops/sec ±1.20% (78 runs sampled)
Fastest is Fluture
```
