/**
 * Created by tushar on 2019-03-11
 */

import {IO} from '../'

import {$} from './internals/ProxyFunction'

describe('typing', () => {
  describe('and', () => {
    it('should return IO<never> if one of them is of type IO<never>', () => {
      $((a: IO<never>, b: IO<string>): IO<never> => a.and(b))
    })
    it('should return IO<never> if both the ios are of type IO<never>', () => {
      $((a: IO<never>, b: IO<never>): IO<never> => a.and(b))
    })
    it('should return IO<[A, B]> if none of the ios are of type IO<never>', () => {
      $((a: IO<string>, b: IO<number>): IO<[string, number]> => a.and(b))
    })
  })
  describe('race', () => {
    it('should return IO<never> if both the ios are of type IO<never>', () => {
      $((a: IO<never>, b: IO<never>): IO<never> => a.race(b))
    })
    it('should return IO<A> if the second io is of type IO<never>', () => {
      $((a: IO<string>, b: IO<never>): IO<string> => a.race(b))
    })
    it('should return IO<A | B> if the none of the ios are of type IO<never>', () => {
      $((a: IO<number>, b: IO<string>): IO<number | string> => a.race(b))
    })
  })
  describe('catch', () => {
    it('should return IO<A>', () => {
      $(
        (a: IO<number>, handler: (error: Error) => IO<number>): IO<number> =>
          a.catch(handler)
      )
    })
    it('should return IO<A> on catching IO<never>', () => {
      $(
        (a: IO<never>, handler: (error: Error) => IO<number>): IO<number> =>
          a.catch(handler)
      )
    })
  })
})
