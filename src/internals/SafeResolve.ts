import {REJ} from './REJ'
import {RES} from './RES'

/**
 * Calls the resolve function safely inside a try-catch block.
 * @ignore
 */
export const SafeResolve = <E, A>(a: A, rej: REJ<E>, res: RES<A>) => {
  try {
    res(a)
  } catch (e) {
    rej(e as E)
  }
}
