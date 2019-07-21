import {Await} from '../main/Await'
import {Exit} from '../main/Exit'
import {Fiber} from '../main/Fiber'
import {FIO, UIO} from '../main/FIO'
import {Ref} from '../main/Ref'

/**
 * Cancels the provided fiber on exit status.
 * Sets the provided ref if two responses have been received.
 * @ignore
 */
export const coordinate = <E1, A1, E2, A2>(
  exit: Exit<E1, A1>,
  fiber: Fiber<E2, A2>,
  ref: Ref<Exit<E1, A1>>,
  count: Ref<number>,
  await: Await<never, boolean>
): UIO<boolean> =>
  ref
    .set(exit)
    .chain(e =>
      Exit.isFailure(e)
        ? fiber.abort.and(await.set(FIO.of(true)))
        : count
            .update(_ => _ + 1)
            .and(
              count.read.chain(value =>
                value === 2 ? await.set(FIO.of(true)) : FIO.of(false)
              )
            )
    )
