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
Fluture x 8,280 ops/sec ±3.43% (73 runs sampled)
FIO x 5,838 ops/sec ±1.03% (80 runs sampled)
Fastest is Fluture
```

## NestedChains

```bash
node benchmarks/NestedChain.js
FIO2 x 389 ops/sec ±2.35% (75 runs sampled)
FIO x 358 ops/sec ±1.94% (75 runs sampled)
Fluture x 860 ops/sec ±2.18% (75 runs sampled)
Fastest is Fluture
```