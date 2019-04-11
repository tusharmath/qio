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

  return {
    cancel: () => timeline.push(['CANCELLED', sh.now()]),
    create: <T>(...slice: TimelineList<T>): TimelineList<T> => slice,
    fork: () => timeline.push(['FORKED', sh.now()]),
    list: (): TimelineList<A> => timeline.slice(0),
    reject: (e: Error) => timeline.push(['REJECT', sh.now(), e.toString()]),
    resolve: (a: A) => timeline.push(['RESOLVE', sh.now(), a])
  }
}
