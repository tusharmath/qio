export class Stack<A> {
  private cache: A | undefined = undefined

  private readonly stackA = new Array<A>()
  public get top(): A | undefined {
    if (this.cache === undefined) {
      if (this.stackA.length === 0) {
        return undefined
      }

      return this.stackA[this.stackA.length - 1]
    }

    return this.cache
  }
  public isEmpty(): boolean {
    return this.cache === undefined && this.stackA.length === 0
  }
  public pop(): A | undefined {
    if (this.cache !== undefined) {
      const r = this.cache
      this.cache = undefined

      return r
    }

    return this.stackA.pop()
  }
  public push(a: A): void {
    if (this.cache === undefined) {
      this.cache = a
    } else {
      this.stackA.push(this.cache)
      this.cache = a
    }
  }
}
