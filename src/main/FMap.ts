import {check} from 'checked-exceptions'

import {FIO, IO, UIO} from './FIO'

export const NoSuchElement = check('NoSuchElement')

/**
 * A light weight wrapper over the Javascript's mutable Map.
 * For most use cases a more obvious choice would be to use an [immutable Map].
 *
 * [immutable Map]: https://immutable-js.github.io/immutable-js/docs/#/Map
 */
export class FMap<K, V> {
  public static of<K = never, V = never>(): UIO<FMap<K, V>> {
    return FIO.uio(() => new FMap())
  }
  private readonly cache = new Map<K, V>()
  private constructor() {}

  public get(key: K): IO<typeof NoSuchElement.info, V> {
    return FIO.uio(() => this.cache.get(key)).chain(_ =>
      _ === undefined ? FIO.reject(NoSuchElement.of()) : FIO.of(_)
    )
  }

  public has(key: K): UIO<boolean> {
    return FIO.uio(() => this.cache.has(key))
  }

  public memoize<E1, R1>(
    fn: (a: K) => FIO<E1, V, R1>
  ): (a: K) => FIO<E1, V, R1> {
    return (a: K) => this.get(a).catch(() => fn(a).chain(r => this.set(a, r)))
  }

  public set(key: K, value: V): UIO<V> {
    return FIO.uio(() => void this.cache.set(key, value)).const(value)
  }
}
