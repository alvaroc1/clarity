import * as net from 'net'


const guacPort = 4822

class Server {

  #clarityPort = 9002

  constructor(port?: number) {
    if (port) {
      this.#clarityPort = port
    }
  }

  run () {
    const server = net.createServer({ pauseOnConnect: true }, socket => {
      socket.on('data', data => {
        console.log(data)
  
        try {
          //if (!socketClosed) socket.write("mouse,0,0,0")
        } catch (ex) {
          console.log(ex)
        }
      })
    })
    server.listen(this.#clarityPort)
  }
}
