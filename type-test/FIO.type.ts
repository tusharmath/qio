/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../'

//#region ASYNC
// $ExpectType FIO<never, never, never>
FIO.async((env1, rej, res) => res(10))

// $ExpectType FIO<never, never, never>
FIO.async((env: {a: number}, rej, res, runtime) => {
  const cancel = runtime.delay(() => {}, 10)

  return () => cancel.cancel()
})

// $ExpectType FIO<never, never, never>
FIO.async((env, rej, res) => res(10))

// $ExpectType FIO<{ a: number; }, never, string>
FIO.async<{a: number}, never, string>((env, rej, res) => res(10))
//#endregion

//#region Operators
// $ExpectType FIO<never, never, number>
FIO.of(1000)

// $ExpectType FIO<never, number, never>
FIO.reject(1000)

// $ExpectType FIO<never, never, number>
FIO.reject(1000).catch(() => FIO.of(10))

// $ExpectType FIO<never, never, number>
FIO.encase((a: string, b: number) => parseInt(a, 10) + b)('10', 2)

// $ExpectType FIO<never, never, number>
FIO.reject(new Error('!!!')).catch(() => FIO.of(10))

// $ExpectType FIO<never, never, string | number>
FIO.of('OLA').catch(() => FIO.of(10))

// $ExpectType FIO<never, never, number>
FIO.never().catch(() => FIO.of(10))

// $ExpectType FIO<never, never, number>
FIO.of(100).catch(() => FIO.never())

// $ExpectType FIO<never, never, string | number>
FIO.of(1000).catch(() => FIO.of('HI'))

// $ExpectType FIO<never, never, number>
FIO.of(10).chain(_ => FIO.of(_))
//#endregion

//#region ZIP
// $ExpectType FIO<never, never, never>
FIO.never().zip(FIO.of(10))

// $ExpectType FIO<never, never, never>
FIO.never().zip(FIO.never())

// $ExpectType FIO<never, never, [number, Date]>
FIO.of(1000).zip(FIO.of(new Date()))

// $ExpectType FIO<never, never, [number, Date]>
FIO.of(1000).zip(FIO.of(new Date()))
//#endregion

//#region Environment Merge
interface IE1 {
  e: 'e1'
}
interface IE2 {
  e: 'e2'
}

declare const a: FIO<{console: Console}, IE1, number>
declare const b: FIO<{process: NodeJS.Process}, IE2, string>

// $ExpectType FIO<{ console: Console; } & { process: Process; }, IE1 | IE2, string>
a.chain(() => b)
//#endregion

//#region Race
// // $ExpectType FIO<unknown, never, never>
// FIO.never().race(FIO.never())

// // $ExpectType FIO<unknown, never, number>
// FIO.never().race(FIO.of(10))

// // $ExpectType FIO<unknown, never, number>
// FIO.never().race(FIO.of(10))

// // $ExpectType FIO<unknown, never, number | Date>
// FIO.of(1000).race(FIO.of(new Date()))

// // $ExpectType FIO<unknown, number, never>
// FIO.never().race(FIO.reject(10))
//#endregion
