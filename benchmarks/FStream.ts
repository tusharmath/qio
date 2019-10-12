/**
 * Created by tushar on 09/09/19
 */

/* tslint:disable */
import {Suite} from 'benchmark'

import {FIO, UIO} from '../src/main/FIO'

import {PrintLn} from './internals/PrintLn'
import {fioRuntime} from './internals/RunSuite'

const suite = new Suite('Stream')

const count = 1e6
const arr = new Array<number>()

for (let i = 0; i < count; i++) {
  arr.push(i)
}

const fioIteration = FIO.encase((numbers: number[]) => {
  let sum = 0
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i]
  }

  return sum
})

function fioRecursion(numbers: number[]) {
  function itar(i: number, sum: number): UIO<number> {
    return i === numbers.length
      ? FIO.of(sum)
      : FIO.call(itar, i + 1, sum + numbers[i])
  }

  return itar(0, 0)
}

suite

  .add(
    'Recursion',
    (cb: IDefer) =>
      fioRuntime.unsafeExecute(fioRecursion(arr), () => cb.resolve()),
    {defer: true}
  )

  .add(
    'Iterative',
    (cb: IDefer) =>
      fioRuntime.unsafeExecute(fioIteration(arr), () => cb.resolve()),
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
