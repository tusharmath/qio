import {Suite} from 'benchmark'
import * as Fluture from 'fluture'
import {noop} from '../src/internals/Noop'
import {FIO, interpretSyncFIO} from '../src/main/FIO'
import {PrintLn} from './internals/PrintLn'

/**
 * Created by tushar on 2019-05-20
 */

const suite = new Suite('NestedMap')

const MAX = 1e4
const nothing = () => {}

const flutureMapper = (_: bigint) => Fluture.of(_ + BigInt(1))
let fluture = Fluture.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fluture = fluture.chain(flutureMapper)
}

const fioMapper = (_: bigint) => FIO.of(_ + BigInt(1))
let fio = FIO.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fio = fio.chain(fioMapper)
}

interface Defer {
  reject(): void
  resolve(): void
}
suite
  .add(
    'FIO',
    (cb: Defer) => {
      interpretSyncFIO(fio, undefined, [], noop, () => cb.resolve())
    },
    {defer: true}
  )
  .add(
    'Fluture',
    (cb: Defer) => {
      fluture.fork(nothing, () => cb.resolve())
    },
    {defer: true}
  )

  .on('cycle', (event: Event) => {
    PrintLn(String(event.target))
  })
  .on('complete', function(this: Suite): void {
    PrintLn(
      'Fastest is ' +
        this.filter('fastest')
          .map((i: {name: string}) => i.name)
          .join('')
    )
  })
  .run()
