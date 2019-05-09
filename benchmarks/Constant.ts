/* tslint:disable */
/**
 * Created by tushar on 2019-05-09
 */
import {Suite} from 'benchmark'
import * as Fluture from 'fluture'

import {FIO} from '../src/main/FIO'
import {defaultRuntime} from '../src/runtimes/DefaultRuntime'

// tslint:disable-next-line:no-require-imports

const suite = new Suite()

const runtime = defaultRuntime()
const fluture = Fluture.of(10)
const fio = FIO.of(10)
const nothing = () => {}
interface Defer {
  resolve(): void
}
suite
  .add(
    'FIO',
    (cb: Defer) => {
      runtime.execute(fio, () => cb.resolve())
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
    console.log(String(event.target))
  })
  .on('complete', function(): void {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run()
