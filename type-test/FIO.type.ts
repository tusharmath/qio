/**
 * Created by tushar on 2019-04-24
 */

import {FIO} from '../'

// $ExpectType FIO<unknown, never, never>
FIO.from((env1, rej, res) => res(10))

// $ExpectType FIO<{ a: number; }, never, never>
FIO.from((env: {a: number}, rej, res, runtime) => {
  const cancel = runtime.scheduler.delay({execute: () => {}}, 10)

  return () => cancel.cancel()
})

// $ExpectType FIO<unknown, never, never>
FIO.from((env, rej, res) => res(10))

// $ExpectType FIO<{ a: number; }, never, string>
FIO.from<{a: number}, never, string>((env, rej, res) => res(10))

// $ExpectType FIO<unknown, never, number>
FIO.of(1000)

// $ExpectType FIO<unknown, number, never>
FIO.reject(1000)

// $ExpectType FIO<unknown, never, number>
FIO.reject(1000).catch(() => FIO.of(10))

// $ExpectType FIO<unknown, never, number>
FIO.encase((a: string, b: number) => parseInt(a, 10) + b)('10', 2)
