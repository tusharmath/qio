import {Await} from '../main/Await'
import {Either} from '../main/Either'
import {Fiber} from '../main/Fiber'
import {FIO, UIO} from '../main/FIO'
import {Ref} from '../main/Ref'

/**
 * Cancels the provided fiber on exit status.
 * Sets the provided ref if two responses have been received.
 * @ignore
 */
export const coordinate = <E1, A1, E2, A2>(
  exit: Either<E1, A1>,
  fiber: Fiber<E2, A2>,
  ref: Ref<Either<E1, A1>>,
  count: Ref<number>,
  await: Await<never, boolean>
): UIO<boolean> =>
  ref
    .set(exit)
    .chain(e =>
      e.fold(
        FIO.of(false),
        () => fiber.abort.and(await.set(FIO.of(true))),
        () =>
          count
            .update(_ => _ + 1)
            .and(
              count.read.chain(value =>
                value === 2 ? await.set(FIO.of(true)) : FIO.of(false)
              )
            )
      )
    )
