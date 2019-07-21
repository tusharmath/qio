/* tslint:disable: no-use-before-declare no-console no-unbound-method strict-comparisons */

import {FIO} from '../..'
import {UIO} from '../../src/main/FIO'
import {FMap} from '../../src/main/FMap'
import {defaultRuntime} from '../../src/runtimes/DefaultRuntime'

const fib = (N: bigint) =>
  FMap.of<bigint, bigint>().chain(cache => {
    const itar = cache.memoize(
      (n: bigint): UIO<bigint> => {
        if (n <= 2n) {
          return FIO.of(n)
        }

        return itar(n - 1n).zipWith(itar(n - 2n), (a, b) => a + b)
      }
    )

    return itar(N)
  })

defaultRuntime().execute(fib(10n), console.log)
