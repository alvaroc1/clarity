
export class AsyncQueue <T> {
  #buffer: T[] = []
  #consumers: Array<(v: T) => void> = []

  toString () {
    return `AsyncQueue { buffer = ${this.#buffer.length}, consumers = ${this.#consumers.length} }`
  }

  offer (value: T): void {
    console.log(`AsyncQueue.ts: offer(${value})`)
    this.#buffer.push(value)
    this.#notify()
  }

  #notify = () => {
    if (this.#consumers.length > 0 && this.#buffer.length > 0) {
      const [v, consumer] = [this.#buffer.shift()!, this.#consumers.shift()!]
      consumer(v)
      this.#notify()
    }
  }

  async poll (): Promise<T> {
    const p = new Promise<T>((resolve, _) => {
      this.#consumers.push(resolve)
    })
    //console.log(`AsyncQueue.ts: Consumers ${this.#consumers.length}`)
    this.#notify()
    return p
  }
}
