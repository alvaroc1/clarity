
type MVar<A> = {
  take (): Promise<A>
  put (v: A): Promise<void>
}

type MVarLock = {
  aquire(): Promise<void>
  release(): Promise<void>
}

export const MVar = {
  create <A>(value: A): MVar<A> {
    return createInternal(value)
  },

  empty <A>(): MVar<A> {
    return createInternal<A>(undefined)
  }
}


export function createMVarLock(): MVarLock {
  const mvar = MVar.create<void>(undefined)
  
  return {
    async aquire () {
      return mvar.take()
    },
    async release () {
      return mvar.put(undefined)
    }
  }
}

function createInternal <A>(value: A | undefined) {
  const consumers: Array<(v: A) => void> = []
  const providers: Array<() => A> = []

  if (value !== undefined) {
    providers.push(() => value)
  }

  return {
    async take (): Promise<A> {
      const provider = providers.shift()
      if (provider) {
        return provider()
      } else {
        return await new Promise<A>(resolve => consumers.push(resolve))
      }
    },
  
    async put (value: A): Promise<void> {
      const consumer = consumers.shift()
      if (consumer) {
        return consumer(value)
      } else {
        return await new Promise<void>(resolve => {
          providers.push(() => {
            resolve()
            return value
          })
        })
      }
    }
  }
}

