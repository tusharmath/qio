/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../'

// $ExpectType FIO<unknown, never, never>
FIO.async((env1, rej, res) => res(10))

// $ExpectType FIO<{ a: number; }, never, never>
FIO.async((env: {a: number}, rej, res, runtime) => {
  const cancel = runtime.scheduler.delay({execute: () => {}}, 10)

  return () => cancel.cancel()
})

// $ExpectType FIO<unknown, never, never>
FIO.async((env, rej, res) => res(10))

// $ExpectType FIO<{ a: number; }, never, string>
FIO.async<{a: number}, never, string>((env, rej, res) => res(10))

// $ExpectType FIO<unknown, never, number>
FIO.of(1000)

// $ExpectType FIO<unknown, number, never>
FIO.reject(1000)

// $ExpectType FIO<unknown, never, number>
FIO.reject(1000).catch(() => FIO.of(10))

// $ExpectType FIO<unknown, never, number>
FIO.encase((a: string, b: number) => parseInt(a, 10) + b)('10', 2)

// $ExpectError Property 'b' is missing in type '{ a: string; }' but required in type '{ b: string; }'.
const program: FIO<{a: string}, never, void> = FIO.access(
  (_: {b: string}) => _.b
).chain(() => program)
