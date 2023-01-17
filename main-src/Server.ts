
import * as net from 'net'
import { MVar } from '../util/MVar'

export namespace Server {

  export function create (port: number, handler: (data: AsyncIterable<Buffer>, write: (data: string) => void) => void): Promise<Server> {
    const dataMVar = MVar.empty<Buffer>()
    const openSockets: net.Socket[] = []

    const netServer = net.createServer({ pauseOnConnect: true}, async socket => {
      socket.on('data', (data) => {
        void dataMVar.put(data)
      })

      handler({
        [Symbol.asyncIterator](): AsyncIterator<Buffer> {
          return {
            async next () {
              const value = await dataMVar.take()
              return {done: false, value}
            },
            /*
            async return () {
              netServer.close();
              return {done: true, value: undefined}
            }
            */
          }
        }
      }, (data) => socket.write(data))

      socket.resume();
    });

    netServer.on('error', (error) => {
      console.error(`Server - error: ${error}`)
    })
    netServer.on('close', () => {
      console.log(`Server - close`)
    })
    netServer.on('listening', () => {
      console.log(`Server - listening`)
    })
    netServer.on('connection', (socket) => {
      openSockets.push(socket)
      socket.on('close', () => {
        const idx = openSockets.indexOf(socket)
        openSockets.splice(idx, 1)
      })
    })

    return new Promise(resolve => {
      void netServer.listen(port, () => {
        resolve({
          close (): Promise<void> {
            // destroy any open sockets
            openSockets.forEach((socket) => {
              socket.destroy()
            })
            
            return new Promise((resolve, reject) => {
              netServer.once('error', (error) => {
                reject(error)
              })
              netServer.close((result) => {
                if (result === undefined) {
                  resolve()
                }
                else reject(result)
              })
            })
          },
        })
      })
    })
  }
}

type Server = {
  close (): Promise<void>
}
