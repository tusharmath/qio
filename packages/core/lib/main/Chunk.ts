/* tslint:disable: prefer-function-over-method */

const split = (min: number, max: number, count: number, expected: number) => {
  for (let i = 0; i < count; i++) {
    if (i * min + (count - i) * max === expected) {
      return i
    }
  }

  return count
}

const createChunkCapacity = (
  count: number,
  minSize: number,
  maxSize: number,
  distribution: number
) => {
  const chunks = new Array()
  for (let i = 0; i < count; i++) {
    chunks.push(i < distribution ? minSize : maxSize)
  }

  return chunks
}

const createChunks = <A>(arr: A[], chunkCount: number): A[][] => {
  const itemCount = arr.length
  const chunks = new Array<A[]>([])
  const minChunkSize = Math.floor(arr.length / chunkCount)
  const maxChunkSize = minChunkSize + 1
  const distribution = split(minChunkSize, maxChunkSize, chunkCount, itemCount)
  const chunkCapacity = createChunkCapacity(
    chunkCount,
    minChunkSize,
    maxChunkSize,
    distribution
  )

  let selectedChunk = 0

  for (let i = 0; i < itemCount; i++) {
    if (chunks[selectedChunk].length === chunkCapacity[selectedChunk]) {
      selectedChunk++
      chunks.push([])
    }
    chunks[selectedChunk].push(arr[i])
  }

  return chunks
}

export abstract class Chunk<A> implements Iterable<A> {
  public static createN<A>(arr: A[], n: number): Chunk<A> {
    return createChunks(arr, n)
      .map((_) => Chunk.from(_))
      .reduce((a, c) => a.concat(c), Chunk.empty())
  }
  public static empty<A>(): Chunk<A> {
    return new Empty()
  }
  public static from<A>(arr: A[]): Chunk<A> {
    return new ArrayC(arr)
  }

  public static isEmpty<A>(C: Chunk<A>): C is Empty {
    return C instanceof Empty
  }
  public static of<A>(A: A): Chunk<A> {
    return new Value(A)
  }

  public abstract asArray: A[]
  public abstract readonly length: number
  public abstract [Symbol.iterator](): Iterator<A>
  public chain<B>(fn: (A: A) => Chunk<B>): Chunk<B> {
    return this.fold(Chunk.empty(), (AA, SS) => SS.concat(fn(AA)))
  }
  public concat(that: Chunk<A>): Chunk<A> {
    if (Chunk.isEmpty(that)) {
      return this
    }
    if (Chunk.isEmpty(this)) {
      return that
    }

    return new Concat(this, that)
  }
  public abstract filter(fn: (A: A) => boolean): Chunk<A>
  public abstract fold<S>(S: S, fn: (A: A, S: S) => S): S
  public abstract map<B>(fn: (A: A) => B): Chunk<B>
}

class Concat<A> extends Chunk<A> {
  public readonly length = this.L.length + this.R.length
  public constructor(
    private readonly L: Chunk<A>,
    private readonly R: Chunk<A>
  ) {
    super()
  }
  public get asArray(): A[] {
    return this.L.asArray.concat(this.R.asArray)
  }
  public *[Symbol.iterator](): Iterator<A> {
    for (const i of this.L) {
      yield i
    }
    for (const i of this.R) {
      yield i
    }
  }

  public filter(fn: (A: A) => boolean): Chunk<A> {
    return new Concat(this.L.filter(fn), this.R.filter(fn))
  }
  public fold<S>(S: S, fn: (A: A, S: S) => S): S {
    return this.R.fold(this.L.fold(S, fn), fn)
  }
  public map<B>(fn: (A: A) => B): Chunk<B> {
    return new Concat(this.L.map(fn), this.R.map(fn))
  }
}

class ArrayC<A> extends Chunk<A> {
  public readonly length = this.array.length
  public constructor(private readonly array: A[]) {
    super()
  }
  public get asArray(): A[] {
    return this.array
  }
  public [Symbol.iterator](): Iterator<A> {
    return this.array[Symbol.iterator]()
  }
  public filter(fn: (A: A) => boolean): Chunk<A> {
    return new ArrayC(this.array.filter(fn))
  }
  public fold<S>(S: S, fn: (A: A, S: S) => S): S {
    let value: S = S

    for (let i = 0; i < this.array.length; i++) {
      value = fn(this.array[i], value)
    }

    return S
  }
  public map<B>(fn: (A: A) => B): Chunk<B> {
    return new ArrayC(this.array.map(fn))
  }
}

class Empty extends Chunk<never> {
  public readonly length = 0
  public get asArray(): never[] {
    return []
  }

  public *[Symbol.iterator](): Iterator<never> {}

  public filter(fn: (A: never) => boolean): Chunk<never> {
    return this
  }
  // tslint:disable-next-line: prefer-function-over-method
  public fold<S>(S: S, fn: (A: never, S: S) => S): S {
    return S
  }
  public map<B>(fn: (A: never) => B): Chunk<B> {
    return this
  }
}

class Value<A> extends Chunk<A> {
  public length = 1
  public constructor(private readonly value: A) {
    super()
  }
  public get asArray(): A[] {
    return [this.value]
  }
  public *[Symbol.iterator](): Iterator<A> {
    yield this.value
  }
  public filter(fn: (A: A) => boolean): Chunk<A> {
    return fn(this.value) ? new Value(this.value) : new Empty()
  }
  public fold<S>(S: S, fn: (A: A, S: S) => S): S {
    return fn(this.value, S)
  }
  public map<B>(fn: (A: A) => B): Chunk<B> {
    return new Value(fn(this.value))
  }
}
