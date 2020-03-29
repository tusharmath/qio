/**
 * Created by tushar on 09/09/19
 */

import {QIO} from '@qio/core'
import {Suite} from 'benchmark'

import {PrintLn} from '../internals/PrintLn'
import {qioRuntime} from '../internals/RunSuite'

const suite = new Suite('QStream')

const count = 1e6
const arr = new Array<number>()

for (let i = 0; i < count; i++) {
  arr.push(i)
}

const qioIteration = QIO.encase((numbers: number[]) => {
  let sum = 0
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i]
  }

  return sum
})
const qioRecursion = (numbers: number[]) => {
  const itar = (i: number, sum: number): QIO<number> =>
    i === numbers.length
      ? QIO.resolve(sum)
      : QIO.call(itar, i + 1, sum + numbers[i])

  return itar(0, 0)
}

suite

  .add(
    'Recursion',
    (cb: IDefer) =>
      qioRuntime.unsafeExecute(qioRecursion(arr), () => cb.resolve()),
    {defer: true}
  )

  .add(
    'Iterative',
    (cb: IDefer) =>
      qioRuntime.unsafeExecute(qioIteration(arr), () => cb.resolve()),
    {defer: true}
  )

  .on('cycle', (event: Event) => {
    PrintLn(String(event.target))
  })

  .on('complete', function (this: Suite): void {
    PrintLn(
      'Fastest is ' +
        this.filter('fastest')
          .map((i: {name: string}) => i.name)
          .join('')
    )
  })
  .run()
