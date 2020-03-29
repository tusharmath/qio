import {QIO} from './QIO'

export class NoSuchElement extends Error {}

/**
 * A light weight wrapper over the Javascript's mutable Map.
 * For most use cases a more obvious choice would be to use an [immutable Map].
 *
 * [immutable Map]: https://immutable-js.github.io/immutable-js/docs/#/Map
 */
export class FMap<K, V> {
  public static of<K = never, V = never>(): QIO<FMap<K, V>> {
    return QIO.lift(() => new FMap())
  }
  private readonly cache = new Map<K, V>()
  private constructor() {}
  public get(key: K): QIO<V, NoSuchElement> {
    return QIO.lift(() => this.cache.get(key)).chain((_) =>
      _ === undefined ? QIO.reject(new NoSuchElement()) : QIO.resolve(_)
    )
  }
  public has(key: K): QIO<boolean> {
    return QIO.lift(() => this.cache.has(key))
  }
  public memoize<E1, R1>(
    fn: (a: K) => QIO<V, E1, R1>
  ): (a: K) => QIO<V, E1, R1> {
    return (a: K) => this.get(a).catch(() => fn(a).chain((r) => this.set(a, r)))
  }
  public set(key: K, value: V): QIO<V> {
    return QIO.lift(() => void this.cache.set(key, value)).const(value)
  }
}
