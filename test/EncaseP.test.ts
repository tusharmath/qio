/**
 * Created by tushar on 2019-03-11
 */
import {assert} from 'chai'
import {scheduler} from 'ts-scheduler'

import {FIO} from '../'

describe('encaseP', () => {
  it('should resolve via promises', async () => {
    const fetch = (...t: string[]) => Promise.resolve(t.join(','))
    const fetchF = FIO.encaseP(fetch)
    const actual = await fetchF('a', 'b', 'c').toPromise({scheduler})

    const expected = 'a,b,c'
    assert.equal(actual, expected)
  })
})
