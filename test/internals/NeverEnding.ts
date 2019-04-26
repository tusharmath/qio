import {IO} from '../../src/main/IO'

/**
 * An IO that never completes but can be cancelled
 */
export const NeverEnding = () => {
  let cancelled = false

  return {
    io: IO.from(() => () => (cancelled = true)),
    isCancelled: () => cancelled
  }
}
