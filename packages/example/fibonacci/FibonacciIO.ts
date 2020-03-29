/* tslint:disable: no-use-before-declare no-console no-unbound-method strict-comparisons */

import {defaultRuntime, FMap, QIO} from '@qio/core'

const fib = (N: bigint) =>
  FMap.of<bigint, bigint>().chain((cache) => {
    const itar = cache.memoize(
      (n: bigint): QIO<bigint> => {
        if (n <= 2n) {
          return QIO.resolve(n)
        }

        return itar(n - 1n).zipWith(itar(n - 2n), (a, b) => a + b)
      }
    )

    return itar(N)
  })

defaultRuntime().unsafeExecute(fib(10n), console.log)
