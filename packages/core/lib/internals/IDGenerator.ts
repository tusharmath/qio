export class IDGenerator {
  private id = 0
  public create(): number {
    return this.id++
  }
}
