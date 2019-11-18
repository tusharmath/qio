/* tslint:disable no-unbound-method no-for-in */

import {QIO} from '@qio/core'
import * as fs from 'fs'
export * from 'fs'

/**
 * A spec object that has keys and values of type function.
 */
interface ISpec<A> {
  [k: string]: (...T: never[]) => A
}

/**
 * An environment for FS
 */
interface IFSEnv<T extends unknown[], A, K extends string | number | symbol> {
  fs: {
    [k in K]: (...T: T) => QIO<A, Error>
  }
}

/**
 * Converts ISpec<Promise<?>> to ISpec<QIO<?, Error, IFSEnv>>
 */
type iQSpecR<S extends ISpec<unknown>> = {
  [K in keyof S]: S[K] extends (...T: infer T) => Promise<infer A>
    ? (...T: T) => QIO<A, Error, IFSEnv<T, A, K>>
    : never
}

/**
 * Converts ISpec<Promise<?>> to ISpec<QIO<?, Error>>
 */
type iQSpec<S extends ISpec<Promise<unknown>>> = {
  [K in keyof S]: S[K] extends (...T: infer T) => Promise<infer A>
    ? (...T: T) => QIO<A, Error>
    : never
}

/**
 * Creates a spec object that has functions that have external dependency on IFSEnv
 */
const createFSSpecR = <S extends ISpec<Promise<unknown>>>(S: S): iQSpecR<S> => {
  const out: {[k in keyof S]?: (...t: unknown[]) => unknown} = {}

  for (const key in S) {
    if (S.hasOwnProperty(key)) {
      out[key] = (...t: unknown[]) =>
        QIO.accessM((_: IFSEnv<unknown[], unknown, typeof key>) =>
          _.fs[key](...t)
        )
    }
  }

  return out as iQSpecR<S>
}

/**
 * Creates a spec object that has functions that don't have any external dependency on env.
 */
const createFSSpec = <S extends ISpec<Promise<unknown>>>(S: S): iQSpec<S> => {
  const out: {[k in keyof S]?: (...t: unknown[]) => unknown} = {}

  for (const key in S) {
    if (S.hasOwnProperty(key)) {
      out[key] = (...t: unknown[]) =>
        QIO.accessM((_: IFSEnv<unknown[], unknown, typeof key>) =>
          _.fs[key](...t)
        )
    }
  }

  return out as iQSpec<S>
}

const close = async (fd: number): Promise<void> =>
  new Promise((res, rej) =>
    // TODO: Add tests
    // tslint:disable-next-line: no-null-undefined-union
    fs.close(fd, (err: NodeJS.ErrnoException | undefined | null) =>
      err !== undefined && err !== null ? rej(err) : res()
    )
  )
const open = (
  path: string | Buffer,
  flags: string | number,
  mode?: number
): Promise<number> => fs.promises.open(path, flags, mode).then(_ => _.fd)

const FSPromises = {...fs.promises, open, close}
export const FS = createFSSpecR(FSPromises)
export const FSEnv = createFSSpec(FSPromises)
