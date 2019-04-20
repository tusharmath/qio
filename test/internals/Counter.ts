/**
 * Created by tushar on 2019-04-15
 */

import {IO} from '../../src/main/IO'

export const Counter = (n: number = 0) => {
  let count = n

  return {
    getCount: () => count,
    inc: IO.try(() => (count += 1))
  }
}
