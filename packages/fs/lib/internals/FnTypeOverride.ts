/* tslint:disable only-arrow-functions*/
// prettier-ignore


/**
 * Converts any overloaded function that accepts both promise and callbacks
 * based APIs, to support only a promise based API.
 *
 * THIS IS A HACK. It is not a generic implementation.
 *
 * - It doesn't work for `fs.open`.
 * - It should be used with care.
 */
export function FnTypeOverride<X>(fn: () => Promise<X>): () => Promise<X>
export function FnTypeOverride<X, A1>(fn: (A1: A1) => Promise<X>): (A1: A1) => Promise<X>
export function FnTypeOverride<X, A1, A2>(fn: (A1: A1, A2: A2) => Promise<X>): (A1: A1, A2: A2) => Promise<X>
export function FnTypeOverride<X, A1, A2, A3>(fn: (A1: A1, A2: A2, A3: A3) => Promise<X>): (A1: A1, A2: A2, A3: A3) => Promise<X>
export function FnTypeOverride<X, A1, A2, A3, A4>(fn: (A1: A1, A2: A2, A3: A3, A4: A4) => Promise<X>): (A1: A1, A2: A2, A3: A3, A4: A4) => Promise<X>
export function FnTypeOverride<X, A1, A2, A3, A4, A5>(fn: (A1: A1, A2: A2, A3: A3, A4: A4, A5: A5) => Promise<X>): (A1: A1, A2: A2, A3: A3, A4: A4, A5: A5) => Promise<X>
export function FnTypeOverride(fn: (...t: unknown[]) => Promise<unknown>): unknown {
  return fn
}
