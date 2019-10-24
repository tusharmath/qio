/**
 * Created by tushar on 2019-04-24
 */

import {defaultRuntime, QIO} from '@qio/core'

//#region ASYNC
// $ExpectType QIO<never, never, unknown>
QIO.asyncIO((rej, res) => res(10))

// $ExpectType QIO<never, never, unknown>
QIO.asyncIO((rej, res, runtime) => {
  const cancel = runtime.delay(() => {}, 10)

  return {cancel: () => cancel.cancel()}
})

// $ExpectType QIO<never, never, unknown>
QIO.asyncIO((rej, res) => res(10))

// $ExpectType QIO<never, string, unknown>
QIO.asyncIO<never, string>((rej, res) => res(10))
//#endregion

//#region Operators
// $ExpectType QIO<never, number, unknown>
QIO.of(1000)

// $ExpectType QIO<number, never, unknown>
QIO.reject(1000)

// $ExpectType QIO<never, number, unknown>
QIO.reject(1000).catch(() => QIO.of(10))

// $ExpectType QIO<never, number, unknown>
QIO.encase((a: string, b: number) => parseInt(a, 10) + b)('10', 2)

// $ExpectType QIO<never, number, unknown>
QIO.reject(new Error('!!!')).catch(() => QIO.of(10))

// $ExpectType QIO<never, string | number, unknown>
QIO.of('OLA').catch(() => QIO.of(10))

// $ExpectType QIO<never, number, unknown>
QIO.never().catch(() => QIO.of(10))

// $ExpectType QIO<never, number, unknown>
QIO.of(100).catch(() => QIO.never())

// $ExpectType QIO<never, string | number, unknown>
QIO.of(1000).catch(() => QIO.of('HI'))

// $ExpectType QIO<never, number, unknown>
QIO.of(10).chain(_ => QIO.of(_))
//#endregion

//#region ZIP
// $ExpectType QIO<never, [never, number], unknown>
QIO.never().zip(QIO.of(10))

// $ExpectType QIO<never, [never, never], unknown>
QIO.never().zip(QIO.never())

// $ExpectType QIO<never, [number, Date], unknown>
QIO.of(1000).zip(QIO.of(new Date()))

// $ExpectType QIO<never, [number, Date], unknown>
QIO.of(1000).zip(QIO.of(new Date()))
//#endregion

//#region Environment Merge
interface IE1 {
  e: 'e1'
}
interface IE2 {
  e: 'e2'
}

declare const a: QIO<IE1, number, {console: Console}>
declare const b: QIO<IE2, string, {process: NodeJS.Process}>

// $ExpectType QIO<IE1 | IE2, string, { console: Console; } & { process: Process; }>
a.chain(() => b)
//#endregion

// $ExpectType QIO<never, number, unknown>
QIO.never().map(_ => 10)

// $ExpectType QIO<never, never, unknown>
QIO.of(10).chain(QIO.never)

// $ExpectType QIO<never, [number, never], unknown>
QIO.of(10).zip(QIO.never())

// $ExpectType QIO<never, [never, number], unknown>
QIO.never().zip(QIO.of(10))

// $ExpectType QIO<never, number, unknown>
QIO.never().zipWith(QIO.of(10), (a, b) => 10)

// $ExpectType QIO<never, number, unknown>
QIO.never().zipWithPar(QIO.of(10), (a, b) => 10)

// $ExpectType QIO<never, void, unknown>
QIO.never().raceWith(QIO.of(10), QIO.void, QIO.void)

// $ExpectError Argument of type 'QIO<never, number, string>' is not assignable to parameter of type 'QIO<never, number, unknown>'.
defaultRuntime().unsafeExecute(QIO.access((_: string) => _.length))
