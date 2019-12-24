export abstract class Chunk<A> {
  public static empty<A>(): Chunk<A> {
    return new Empty()
  }
  public static from<A>(arr: A[]): Chunk<A> {
    return new ArrayC(arr)
  }
  public abstract readonly length: number
  public chain<B>(fn: (A: A) => Chunk<B>): Chunk<B> {
    return this.fold(Chunk.empty(), (AA, SS) => SS.concat(fn(AA)))
  }
  public concat(that: Chunk<A>): Chunk<A> {
    return new Concat(this, that)
  }
  public abstract filter(fn: (A: A) => boolean): Chunk<A>
  public abstract fold<S>(S: S, fn: (A: A, S: S) => S): S
  public abstract map<B>(fn: (A: A) => B): Chunk<B>
}

class Concat<A> extends Chunk<A> {
  public readonly length = this.L.length + this.R.length
  public constructor(public readonly L: Chunk<A>, public readonly R: Chunk<A>) {
    super()
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
  public constructor(public readonly array: A[]) {
    super()
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
