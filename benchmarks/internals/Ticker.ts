interface FnArgs {
  args: unknown[]
  fn(...t: unknown[]): unknown
}

class Ticker {
  private isFlushing = false
  private readonly q = new Array<FnArgs>()

  public flush(): void {
    if (!this.isFlushing) {
      this.isFlushing = true

      while (this.q.length > 0) {
        const elm = this.q.shift() as FnArgs
        elm.fn.apply(undefined, elm.args)
      }

      this.isFlushing = false
    }
  }

  public nextTick<T extends unknown[]>(
    fn: (...t: T) => unknown,
    ...args: T
  ): void {
    this.q.push({args, fn})
    this.flush()
  }
}

export const ticker = new Ticker()
