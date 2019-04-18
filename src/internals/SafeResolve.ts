import {REJ} from './REJ'
import {RES} from './RES'

/**
 * Calls the resolve function safely inside a try-catch block.
 * @ignore
 */
export const SafeResolve = <A>(a: A, rej: REJ, res: RES<A>) => {
  try {
    res(a)
  } catch (e) {
    rej(e as Error)
  }
}
