
export class AsyncQueue<T> {
  #buffer: T[] = []
  #consumers: Array<(v: T[]) => void> = []

  toString() {
    return `AsyncQueue { buffer = ${this.#buffer.length}, consumers = ${this.#consumers.length} }`
  }

  offer(values: T[]): void {
    values.forEach(v => this.#buffer.push(v))
    this.#notify()
  }

  offerBatch(values: T[]): void {
    values.forEach(v => this.#buffer.push(v))
    this.#notify()
  }

  #notify = () => {
    if (this.#consumers.length > 0 && this.#buffer.length > 0) {
      const consumer = this.#consumers.shift()!
      consumer([...this.#buffer])
      this.#buffer = []
    }
  }

  async poll(): Promise<T[]> {
    const p = new Promise<T[]>((resolve, _) => {
      this.#consumers.push(resolve)
    })
    this.#notify()
    return p
  }

  subscribe = (fn: (values: T[]) => void): void => {
    // asynchronously dequeue commands from the command queue
    const poller = async () => {
      const values = await this.poll()
      fn(values)
      poller()
    }
    poller()
  }
}
