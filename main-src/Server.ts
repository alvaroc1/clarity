
import * as net from 'net'

enum Status {
  starting,
  running,
  stopping,
  stopped,
}

type ServerImplementation = (setup: {
  start: () => void,
  dispose: () => void,
  write: (s: string) => void,
}) => (buf: Buffer) => void

/**
 * A socket server
 */
export class Server {
  #underlying: net.Server
  status: Status = Status.stopped

  #openSockets: net.Socket[] = []

  private constructor(server: net.Server) {
    this.#underlying = server
    this.#underlying.on('error', (error) => {
      console.error(`Server - error: ${error}`)
    })
    this.#underlying.on('close', () => {
      console.log(`Server - close`)
    })
    this.#underlying.on('listening', () => {
      console.log(`Server - listening`)
    })
    this.#underlying.on('connection', (socket) => {
      this.#openSockets.push(socket)
      socket.on('close', () => {
        const idx = this.#openSockets.indexOf(socket)
        this.#openSockets.splice(idx, 1)
      })
    })
  }

  async listen(port: number): Promise<void> {
    this.status = Status.starting
    return new Promise((resolve, reject) => {
      this.#underlying.once('error', (error) => {
        this.status = Status.stopped
        reject(error)
      })
      this.#underlying.listen(port, "localhost", () => {
        this.status = Status.running
        resolve()
      })
    })
  }

  async close(): Promise<void> {
    this.status = Status.stopping
    return new Promise((resolve, reject) => {
      this.#underlying.once('error', (error) => {
        this.status = Status.stopped
        reject(error)
      })
      // destroy any open sockets
      this.#openSockets.forEach((socket) => {
        socket.destroy()
      })
      this.#underlying.close((result) => {
        if (result === undefined) {
          this.status = Status.stopped
          resolve()
        }
        else reject(result)
      })
    })
  }

  static create(setup: ServerImplementation): Server {
    const netServer = net.createServer({ pauseOnConnect: true }, socket => {
      const handler = setup({
        start: () => socket.resume(),
        dispose: () => socket.destroy(),
        write: (s: string) => socket.write(s),
      })

      socket.on('data', data => {
        handler(data)

        try {
          //if (!socketClosed) socket.write("mouse,0,0,0")
        } catch (ex) {
          console.log(ex)
        }
      })
    })

    return new Server(netServer)
  }
}
