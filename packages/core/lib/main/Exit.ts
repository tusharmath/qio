/* tslint:disable: switch-default */
export enum FiberExitTag {
  SUCCESS,
  FAILURE,
  CANCELLED,
}

class FiberCancelled {
  public readonly tag = FiberExitTag.CANCELLED
}

class FiberFailure<E> {
  public readonly tag = FiberExitTag.FAILURE
  public constructor(public readonly cause: E) {}
}

class FiberSuccess<A> {
  public readonly tag = FiberExitTag.SUCCESS
  public constructor(public readonly value: A) {}
}

export type Exit<A, E> = FiberCancelled | FiberFailure<E> | FiberSuccess<A>

export const Exit = {
  ...FiberExitTag,
  cancel: () => new FiberCancelled(),
  fail: <E>(cause: E) => new FiberFailure<E>(cause),
  fold: <A, E>(exit: Exit<A, E>) => <S>(
    S: S,
    AA: (A: A) => S,
    EE: (E: E) => S
  ): S => {
    switch (exit.tag) {
      case FiberExitTag.CANCELLED:
        return S
      case FiberExitTag.FAILURE:
        return EE(exit.cause)
      case FiberExitTag.SUCCESS:
        return AA(exit.value)
    }
  },
  succeed: <A>(value: A) => new FiberSuccess<A>(value),
}
