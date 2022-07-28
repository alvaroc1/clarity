import { app, ipcMain } from 'electron'
import * as net from 'net'
import { Session } from './Session'
import { Command } from '../protocol/Command'
import { Parser } from '../protocol/Parser'


let session: Session | null = null

app.on('ready', async event => {
  const server = net.createServer({ pauseOnConnect: true }, socket => {
    console.log("CONNECTED")

    let socketClosed = false

    const session = Session.create()

    socket.resume()

    const parser = new Parser((cmd) => {
      const parsed = Command.fromInstruction(cmd)
      session.send([parsed])
    })

    socket.on('data', data => {
      parser.parse(data)

      try {
        //if (!socketClosed) socket.write("mouse,0,0,0")
      } catch (ex) {
        console.log(ex)
      }
    })

    socket.on('close', _ => {
      console.log("SOCKET CLOSED")
      socketClosed = true
    })

    socket.on('end', (_: any) => {
      console.log("SOCKET END")
    });

    socket.on('drain', (_: any) => {
      console.log("SOCKET DRAIN")
    });

    socket.on('error', error => {
      console.log(`got error on socket, prob unexpected disconnect (?): ${error.message}`)
    })

    socket.on('disconnect', _ => {
      console.log("DISCONNECT")
    })

    ipcMain.on('event', (_, data) => {
      const encoded = encodeCommand(data)
      socket.write(encoded + ";")
    })
  })
  server.listen(9002)
  server.on('listening', (_: net.Socket) => console.log('listening'))
  server.on('error', (_: net.Socket) => console.log('error'))
  server.on('close', (_: net.Socket) => {
    console.log('server close')
  })
  server.on('clientError', _ => {
    console.log('client error')
  })

});

const encodeCommand = (command: string[]): string => {
  return command.map(segment => {
    const seg = segment.toString()
    return seg.length + "." + seg
  }).join(",")
};