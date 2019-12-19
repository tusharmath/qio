export enum FiberExitTag {
  SUCCESS,
  FAILURE,
  CANCELLED
}

export class FiberCancelled {
  public readonly tag = FiberExitTag.CANCELLED
}

export class FiberFailure<E> {
  public readonly tag = FiberExitTag.FAILURE
  public constructor(public readonly cause: E) {}
}

export class FiberSuccess<A> {
  public readonly tag = FiberExitTag.SUCCESS
  public constructor(public readonly value: A) {}
}

export type Exit<A, E> = FiberCancelled | FiberFailure<E> | FiberSuccess<A>
