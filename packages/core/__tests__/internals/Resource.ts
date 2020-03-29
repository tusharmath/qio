import {QIO} from '../../lib/main/QIO'

export const Resource = (initialCount: number = 0) => {
  let i = initialCount

  return {
    acquire: QIO.lift(() => ++i),
    release: QIO.encase(() => void --i),
    get count(): number {
      return i
    },
    get isReleased(): boolean {
      return i === 0
    },
  }
}
