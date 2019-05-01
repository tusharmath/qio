import {CB} from './CB'

/**
 * Calls the resolve function safely inside a try-catch block.
 * @ignore
 */
export const SafeResolve = <E, A>(a: A, rej: CB<E>, res: CB<A>) => {
  try {
    res(a)
  } catch (e) {
    rej(e as E)
  }
}
