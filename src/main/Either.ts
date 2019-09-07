/* tslint:disable:prefer-function-over-method */

/**
 * Created by tushar on 07/09/19
 */

export abstract class Either<L1, R1> {
  public static left<L>(left: L): Either<L, never> {
    return new Left(left)
  }
  public static neither(): Either<never, never> {
    return new Neither()
  }
  public static right<R>(right: R): Either<never, R> {
    return new Right(right)
  }

  public abstract biChain<L2, R2>(
    LL: (l: L1) => Either<L2, R2>,
    RR: (r: R1) => Either<L2, R2>
  ): Either<L2, R2>

  public biMap<L2, R2>(LL: (l: L1) => L2, RR: (r: R1) => R2): Either<L2, R2> {
    return this.mapL(LL).mapR(RR)
  }

  public chain<R2>(ab: (r: R1) => Either<L1, R2>): Either<L1, R2> {
    return this.chainR(ab)
  }
  public chainL<L2>(ab: (l: L1) => Either<L2, R1>): Either<L2, R1> {
    return this.biChain(ab, Either.right)
  }
  public chainR<R2>(ab: (r: R1) => Either<L1, R2>): Either<L1, R2> {
    return this.biChain(Either.left, ab)
  }

  public abstract fold<S>(
    seed: S,
    LL: (l: L1, s: S) => S,
    RR: (r: R1, s: S) => S
  ): S

  public abstract getLeftOrElse(left: L1): L1
  public abstract getRightOrElse(right: R1): R1
  public map<R2>(ab: (r: R1) => R2): Either<L1, R2> {
    return this.mapR(ab)
  }
  public mapL<L2>(ab: (r: L1) => L2): Either<L2, R1> {
    return this.chainL(r => Either.left(ab(r)))
  }

  public mapR<R2>(ab: (r: R1) => R2): Either<L1, R2> {
    return this.chainR(r => Either.right(ab(r)))
  }
}

class Left<L1> extends Either<L1, never> {
  public readonly isLeft = true
  public readonly isNeither = false
  public readonly isRight = false

  public constructor(public readonly left: L1) {
    super()
  }

  public biChain<L2, R2>(
    LL: (l: L1) => Either<L2, R2>,
    RR: (r: never) => Either<L2, R2>
  ): Either<L2, R2> {
    return LL(this.left)
  }

  public fold<S>(S: S, LL: (l: L1, s: S) => S, RR: (r: never, s: S) => S): S {
    return LL(this.left, S)
  }

  public getLeftOrElse(left: L1): L1 {
    return this.left
  }

  public getRightOrElse(right: never): never {
    return right
  }
}

class Right<R1> extends Either<never, R1> {
  public readonly isLeft = false
  public readonly isNeither = false
  public readonly isRight = true

  public constructor(public readonly right: R1) {
    super()
  }

  public biChain<L2, R2>(
    LL: (l: never) => Either<L2, R2>,
    RR: (r: R1) => Either<L2, R2>
  ): Either<L2, R2> {
    return RR(this.right)
  }
  public fold<S>(S: S, LL: (l: never, s: S) => S, RR: (r: R1, s: S) => S): S {
    return RR(this.right, S)
  }

  public getLeftOrElse(left: never): never {
    return left
  }
  public getRightOrElse(right: R1): R1 {
    return this.right
  }
}

class Neither extends Either<never, never> {
  public readonly isLeft = false
  public readonly isNeither = true
  public readonly isRight = false

  public biChain<L2, R2>(
    LL: (l: never) => Either<L2, R2>,
    RR: (r: never) => Either<L2, R2>
  ): Either<L2, R2> {
    return this
  }

  public fold<S>(
    S: S,
    LL: (l: never, s: S) => S,
    RR: (r: never, s: S) => S
  ): S {
    return S
  }

  public getLeftOrElse(left: never): never {
    return left
  }

  public getRightOrElse(right: never): never {
    return right
  }
}
