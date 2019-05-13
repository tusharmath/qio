import {Suite} from 'benchmark'
import * as Fluture from 'fluture'

import {FIO} from '../src/main/FIO'
import {defaultRuntime} from '../src/runtimes/DefaultRuntime'

import {PrintLn} from './internals/PrintLn'

/**
 * Created by tushar on 2019-05-11
 */

const suite = new Suite('NestedMap')

const MAX = 1e3
const runtime = defaultRuntime()
const nothing = () => {}

let fluture = Fluture.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fluture = fluture.map(_ => _ + BigInt(1))
}

let fio = FIO.of(BigInt(0))
for (let i = 0; i < MAX; i++) {
  fio = fio.map(_ => _ + BigInt(1))
}

interface Defer {
  resolve(): void
}
suite

  .add(
    'Fluture',
    (cb: Defer) => {
      fluture.fork(nothing, () => cb.resolve())
    },
    {defer: true}
  )
  .add(
    'FIO',
    (cb: Defer) => {
      runtime.execute(fio, () => cb.resolve())
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
