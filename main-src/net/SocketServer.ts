
import * as net from 'net'
import { MVar } from '../../util/MVar'
import * as logger from 'electron-log/main'

const log = logger.scope('runServer')

type SocketServerOptions = {
  onAddressInUse: () => void,
  onNoAccess: () => void,
}

type SessionHandler = (
  read: AsyncIterable<Buffer>, 
  write: (data: string) => void,
  close: () => void,
) => {close: () => void}

export const SocketServer = {
  /**
   * @param port 
   * @param handler A function that will receive a read channel and a write channel
   * @returns A function that will close the server
   */
  async start (
    port: number, 
    handler: SessionHandler,
    {onAddressInUse, onNoAccess}: SocketServerOptions
  ): Promise<() => Promise<void>> {
    const openSockets: net.Socket[] = []

    const netServer = net.createServer({ pauseOnConnect: true}, async socket => {
      const dataMVar = MVar.empty<Buffer>()
      socket.on('data', (data) => {
        void dataMVar.put(data)
      })

      socket.on('error', error => {
        error.message
      })

      const session = handler(
        {
          [Symbol.asyncIterator](): AsyncIterator<Buffer> {
            return {
              async next () {
                const value = await dataMVar.take()
                return {done: false, value}
              },
            }
          }
        }, 
        (data) => socket.write(data),
        () => {
          log.info('runServer - closing socket')
          socket.end()
          socket.destroy()
        }
      )

      socket.on('close', () => {
        session.close()
        socket.destroy()
      })

      socket.resume()
    })

    netServer.on('error', error => {
      if ('code' in error) {
        if (error.code === 'EADDRINUSE') {
          return onAddressInUse()
        }
        if (error.code === 'EACCES') {
          return onNoAccess()
        }
      }
      log.error(`Error: ${error}`)
      throw error
    })

    netServer.on('close', () => {
      log.info('Server - close')
    })
    netServer.on('listening', () => {
      log.info('Server - listening')
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
        log.info(`Listening on port ${port}`)
        resolve(
          (): Promise<void> => {
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
        )
      })
    })
  }
}