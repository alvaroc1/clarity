
export class AsyncQueue <T> {
  #buffer: T[] = []
  #consumers: Array<(v: T) => void> = []

  toString () {
    return `AsyncQueue { buffer = ${this.#buffer.length}, consumers = ${this.#consumers.length} }`
  }

  offer (value: T): void {
    this.#buffer.push(value)
    this.#notify()
  }

  offerBatch (values: T[]): void {
    values.forEach(v => this.#buffer.push(v))
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



export class AsyncQueue2 <T> {
  #buffer: T[] = []
  #consumers: Array<(v: T[]) => void> = []

  toString () {
    return `AsyncQueue2 { buffer = ${this.#buffer.length}, consumers = ${this.#consumers.length} }`
  }

  offer (values: T[]): void {
    values.forEach(v => this.#buffer.push(v))
    this.#notify()
  }

  offerBatch (values: T[]): void {
    values.forEach(v => this.#buffer.push(v))
    this.#notify()
  }

  #notify = () => {
    if (this.#consumers.length > 0 && this.#buffer.length > 0) {
      //const [values, consumer] = [this.#buffer.shift()!, this.#consumers.shift()!]
      const consumer = this.#consumers.shift()!
      consumer([...this.#buffer])
      this.#buffer = []
      //this.#notify()
    }
  }

  async poll (): Promise<T[]> {
    const p = new Promise<T[]>((resolve, _) => {
      this.#consumers.push(resolve)
    })
    this.#notify()
    return p
  }
}
