/**
 * Created by tushar on 2019-04-15
 */

import {IO} from '../../src/IO'

export const Counter = () => {
  let count = 0

  return {
    getCount: () => count,
    inc: IO.try(() => (count += 1))
  }
}
