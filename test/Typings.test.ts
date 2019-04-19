/**
 * Created by tushar on 2019-03-11
 */

import {IO} from '../'
import {SchedulerEnv} from '../src/envs/SchedulerEnv'

import {$} from './internals/ProxyFunction'

type DIO<A> = IO<SchedulerEnv, A>
describe('typing', () => {
  describe('zip', () => {
    it('should return DIO<never> if one of them is of type DIO<never>', () => {
      $((a: DIO<never>, b: DIO<string>): DIO<never> => a.zip(b))
    })
    it('should return DIO<never> if both the ios are of type DIO<never>', () => {
      $((a: DIO<never>, b: DIO<never>): DIO<never> => a.zip(b))
    })
    it('should return DIO<[A, B]> if none of the ios are of type DIO<never>', () => {
      $((a: DIO<string>, b: DIO<number>): DIO<[string, number]> => a.zip(b))
    })
  })
  describe('race', () => {
    it('should return DIO<never> if both the ios are of type DIO<never>', () => {
      $((a: DIO<never>, b: DIO<never>): DIO<never> => a.race(b))
    })
    it('should return DIO<A> if the second io is of type DIO<never>', () => {
      $((a: DIO<string>, b: DIO<never>): DIO<string> => a.race(b))
    })
    it('should return DIO<A | B> if the none of the ios are of type DIO<never>', () => {
      $((a: DIO<number>, b: DIO<string>): DIO<number | string> => a.race(b))
    })
  })
  describe('catch', () => {
    it('should return DIO<A>', () => {
      $(
        (a: DIO<number>, handler: (error: Error) => DIO<number>): DIO<number> =>
          a.catch(handler)
      )
    })
    it('should return DIO<A> on catching DIO<never>', () => {
      $(
        (a: DIO<never>, handler: (error: Error) => DIO<number>): DIO<number> =>
          a.catch(handler)
      )
    })
  })
})
