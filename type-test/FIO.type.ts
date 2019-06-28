/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../'

//#region ASYNC
// $ExpectType FIO<never, never, never>
FIO.async((rej, res) => res(10))

// $ExpectType FIO<never, never, never>
FIO.async((rej, res, runtime) => {
  const cancel = runtime.delay(() => {}, 10)

  return {cancel: () => cancel.cancel()}
})

// $ExpectType FIO<never, never, never>
FIO.async((rej, res) => res(10))

// $ExpectType FIO<never, string, never>
FIO.async<never, string>((rej, res) => res(10))
//#endregion

//#region Operators
// $ExpectType FIO<never, number, never>
FIO.of(1000)

// $ExpectType FIO<number, never, never>
FIO.reject(1000)

// $ExpectType FIO<never, number, never>
FIO.reject(1000).catch(() => FIO.of(10))

// $ExpectType FIO<never, number, never>
FIO.encase((a: string, b: number) => parseInt(a, 10) + b)('10', 2)

// $ExpectType FIO<never, number, never>
FIO.reject(new Error('!!!')).catch(() => FIO.of(10))

// $ExpectType FIO<never, string | number, never>
FIO.of('OLA').catch(() => FIO.of(10))

// $ExpectType FIO<never, number, never>
FIO.never().catch(() => FIO.of(10))

// $ExpectType FIO<never, number, never>
FIO.of(100).catch(() => FIO.never())

// $ExpectType FIO<never, string | number, never>
FIO.of(1000).catch(() => FIO.of('HI'))

// $ExpectType FIO<never, number, never>
FIO.of(10).chain(_ => FIO.of(_))
//#endregion

//#region ZIP
// $ExpectType FIO<never, never, never>
FIO.never().zip(FIO.of(10))

// $ExpectType FIO<never, never, never>
FIO.never().zip(FIO.never())

// $ExpectType FIO<never, [number, Date], never>
FIO.of(1000).zip(FIO.of(new Date()))

// $ExpectType FIO<never, [number, Date], never>
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
