/**
 * Created by tushar on 2019-04-15
 */

import {FIO} from '../../src/main/FIO'

export const Counter = (n: number = 0) => {
  let count = n

  return {
    getCount: () => count,
    inc: FIO.access(() => (count += 1))
  }
}
