
interface BoundedQueue<T> {
  enqueue(value: T): Promise<void>
  dequeue(): AsyncIterable<T>
}

export function boundedQueue <T> (maxSize: number): BoundedQueue<T> {
  const queue : T[] = []

  const consumers: Array<(v: T) => void> = []
  const providers: Array<() => T> = []

  return {
    enqueue: async function (value: T): Promise<void> {
      const consumer = consumers.shift()
      if (consumer) {
        return consumer(value)
      }
      if (queue.length < maxSize) {
        queue.push(value)
        return
      } 

      return await new Promise<void>(resolve => {
        providers.push(() => {
          resolve()
          return value
        })
      })
    },
    dequeue: async function* () {
      while (true) {
        while (queue.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          yield queue.shift()!
        }
        yield await new Promise<T>(resolve => consumers.push(resolve))
      }
    }
  }
}


