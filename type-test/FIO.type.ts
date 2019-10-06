/**
 * Created by tushar on 2019-04-24
 */

import {FIO, defaultRuntime} from '../'

//#region ASYNC
// $ExpectType FIO<never, never, unknown>
FIO.asyncIO((rej, res) => res(10))

// $ExpectType FIO<never, never, unknown>
FIO.asyncIO((rej, res, runtime) => {
  const cancel = runtime.delay(() => {}, 10)

  return {cancel: () => cancel.cancel()}
})

// $ExpectType FIO<never, never, unknown>
FIO.asyncIO((rej, res) => res(10))

// $ExpectType FIO<never, string, unknown>
FIO.asyncIO<never, string>((rej, res) => res(10))
//#endregion

//#region Operators
// $ExpectType FIO<never, number, unknown>
FIO.of(1000)

// $ExpectType FIO<number, never, unknown>
FIO.reject(1000)

// $ExpectType FIO<never, number, unknown>
FIO.reject(1000).catch(() => FIO.of(10))

// $ExpectType FIO<never, number, unknown>
FIO.encase((a: string, b: number) => parseInt(a, 10) + b)('10', 2)

// $ExpectType FIO<never, number, unknown>
FIO.reject(new Error('!!!')).catch(() => FIO.of(10))

// $ExpectType FIO<never, string | number, unknown>
FIO.of('OLA').catch(() => FIO.of(10))

// $ExpectType FIO<never, number, unknown>
FIO.never().catch(() => FIO.of(10))

// $ExpectType FIO<never, number, unknown>
FIO.of(100).catch(() => FIO.never())

// $ExpectType FIO<never, string | number, unknown>
FIO.of(1000).catch(() => FIO.of('HI'))

// $ExpectType FIO<never, number, unknown>
FIO.of(10).chain(_ => FIO.of(_))
//#endregion

//#region ZIP
// $ExpectType FIO<never, { 0: never; 1: number; }, unknown>
FIO.never().zip(FIO.of(10))

// $ExpectType FIO<never, { 0: never; 1: never; }, unknown>
FIO.never().zip(FIO.never())

// $ExpectType FIO<never, { 0: number; 1: Date; }, unknown>
FIO.of(1000).zip(FIO.of(new Date()))

// $ExpectType FIO<never, { 0: number; 1: Date; }, unknown>
FIO.of(1000).zip(FIO.of(new Date()))
//#endregion

//#region Environment Merge
interface IE1 {
  e: 'e1'
}
interface IE2 {
  e: 'e2'
}

declare const a: FIO<IE1, number, {console: Console}>
declare const b: FIO<IE2, string, {process: NodeJS.Process}>

// $ExpectType FIO<IE1 | IE2, string, { console: Console; } & { process: Process; }>
a.chain(() => b)
//#endregion

// $ExpectType FIO<never, number, unknown>
FIO.never().map(_ => 10)

// $ExpectType FIO<never, never, unknown>
FIO.of(10).chain(FIO.never)

// $ExpectType FIO<never, { 0: number; 1: never; }, unknown>
FIO.of(10).zip(FIO.never())

// $ExpectType FIO<never, { 0: never; 1: number; }, unknown>
FIO.never().zip(FIO.of(10))

// $ExpectType FIO<never, number, unknown>
FIO.never().zipWith(FIO.of(10), (a, b) => 10)

// $ExpectType FIO<never, number, unknown>
FIO.never().zipWithPar(FIO.of(10), (a, b) => 10)

// $ExpectType FIO<never, void, unknown>
FIO.never().raceWith(FIO.of(10), FIO.void, FIO.void)

// $ExpectError Argument of type 'FIO<never, number, string>' is not assignable to parameter of type 'FIO<never, number, unknown>'.
defaultRuntime().unsafeExecute(FIO.access((_: string) => _.length))
