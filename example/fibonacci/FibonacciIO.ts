/* tslint:disable: no-use-before-declare no-console no-unbound-method */

import {FIO} from '../..'
import {UIO} from '../../src/main/FIO'
import {Ref} from '../../src/main/Ref'
import {defaultRuntime} from '../../src/runtimes/DefaultRuntime'

const fibIO = (n: bigint, ref: Ref<Map<bigint, bigint>>): UIO<bigint> => {
  if (n <= 2n) {
    return FIO.of(n)
  }

  return fibIORef(n - 1n, ref).zipWith(fibIORef(n - 2n, ref), (a, b) => a + b)
}

defaultRuntime().execute(
  FIO.flatten(
    Ref.of(new Map<bigint, bigint>()).map(ref => fibIO(100000n, ref))
  ),
  console.log
)

const fibIORef = (a: bigint, ref: Ref<Map<bigint, bigint>>): UIO<bigint> =>
  ref.read.chain(dict =>
    dict.has(a)
      ? FIO.of(dict.get(a) as bigint)
      : fibIO(a, ref).tap(b => ref.update(dict2 => dict2.set(a, b)))
  )
