import {FIO} from '../../src/main/FIO'

/**
 * An IO that never completes but can be cancelled
 */
export const NeverEnding = () => {
  let cancelled = false

  return {
    io: FIO.from(() => () => (cancelled = true)),
    isCancelled: () => cancelled
  }
}
