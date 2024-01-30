import logger from 'electron-log/main'

const log = logger.scope('boundedQueue')

interface BoundedQueue<T> {
  enqueue(value: T): Promise<void>
  dequeue(): AsyncIterable<T>
}

export function boundedQueue <T> (maxSize: number): BoundedQueue<T> {
  const queue : T[] = []

  const consumers: Array<(v: T) => void> = []
  const providers: Array<() => void> = []

  return {
    enqueue: async function (value: T): Promise<void> {
      // if we have a waiting consumer, give it the value
      const consumer = consumers.shift()
      if (consumer) {
        return consumer(value)
      }
      // otherwise, if there's room in the queue, add it
      if (queue.length < maxSize) {
        queue.push(value)
        return
      }
      // no room in the queue
      // so we schedule the enqueue for when there's room
      return await new Promise<void>(resolve => {
        providers.push(() => {
          queue.push(value)
          resolve()
        })
      })
    },
    dequeue: async function* () {
      while (true) {
        let elem = queue.shift()
        while (elem !== undefined) {
          yield elem

          // we've opened a slot for another element
          // unblock a waiting provider if there is one
          const provider = providers.shift()
          if (provider) {
            provider()
          }
          elem = queue.shift()
        }
        // there's no element so we add this consumer to the list of waiting consumers
        yield await new Promise<T>(resolve => consumers.push(resolve))     
      }
    }
  }
}


