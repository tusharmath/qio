import {Stack} from '@qio/core'
import {Suite} from 'benchmark'

import {PrintLn} from '../internals/PrintLn'

const MAX = 1e6
const suite = new Suite()
suite
  .add('Array', () => {
    const s = new Array<number>()
    for (let i = 0; i < MAX; i++) {
      s.push(i)
      if (i % 2 === 0) {
        s.pop()
      }
    }
  })
  .add('Stack', () => {
    const s = new Stack<number>()
    for (let i = 0; i < MAX; i++) {
      s.push(i)
      if (i % 2 === 0) {
        s.pop()
      }
    }
  })

  .on('cycle', (event: Event) => {
    PrintLn(String(event.target))
  })

  .on('complete', function (this: Suite): void {
    PrintLn(
      'Fastest is ' +
        this.filter('fastest')
          .map((i: {name: string}) => i.name)
          .join('') +
        '\n```'
    )
  })
  .run()
