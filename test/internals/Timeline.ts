import {IScheduler} from 'ts-scheduler'

/**
 * Created by tushar on 2019-03-22
 */

type R<A> = ['RESOLVE', number, A]
type L = ['REJECT', number, string]
type F = ['FORKED', number]
type C = ['CANCELLED', number]

export type TimeSlice<A> = R<A> | L | F | C
export type TimelineList<A> = Array<TimeSlice<A>>

/**
 * A simple timeline of all the events that goes on in the IO world
 */
export const Timeline = <A>(sh: IScheduler) => {
  const timeline = new Array<TimeSlice<A>>()
  let resolvedValue: A | undefined
  let rejectedValue: Error | undefined

  return {
    cancel: () => timeline.push(['CANCELLED', sh.now()]),
    create: <T>(...slice: TimelineList<T>): TimelineList<T> => slice,
    fork: () => timeline.push(['FORKED', sh.now()]),
    getError: (): Error => {
      if (typeof rejectedValue === 'undefined') {
        throw new Error('IO not yet rejected')
      }

      return rejectedValue
    },
    getValue: (): A => {
      if (typeof resolvedValue === 'undefined') {
        throw new Error('IO not yet resolved')
      }

      return resolvedValue
    },
    list: (): TimelineList<A> => timeline.slice(0),
    reject: (e: Error) => {
      rejectedValue = e
      timeline.push(['REJECT', sh.now(), e.toString()])
    },
    resolve: (a: A) => {
      resolvedValue = a
      timeline.push(['RESOLVE', sh.now(), a])
    }
  }
}
