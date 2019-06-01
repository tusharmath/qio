enum Status {
  Failure = 0,
  Success = 1,
  Pending = 2
}

export type Exit<E, A> =
  | [Status.Success, A]
  | [Status.Failure, E]
  | [Status.Pending]

export const Exit = {
  ...Status,
  failure: <E>(e: E): Exit<E, never> => [Status.Failure, e],
  pending: (): Exit<never, never> => [Status.Pending],
  success: <A>(a: A): Exit<never, A> => [Status.Success, a]
}
