import { app, ipcMain } from 'electron'
import * as net from 'net'
import { Session } from './Session'
import { Command } from '../protocol/Command'

let session: Session | null = null

app.on('ready', async event => {
  const server = net.createServer(socket => {
    console.log("CONNECTED")

    let socketClosed = false

    const session = Session.create()

    socket.on('data', data => {
      // process command
      const commands = data.toString()
        .split(";")
        // drop the size of each command at the beginning
        .map((s: string) => s.trim())
        .filter((cmd: string) => cmd !== "")
        .map(cmd => Command.parse(cmd))

      session.send(commands)

      try {
        //if (!socketClosed) socket.write("mouse,0,0,0")
      } catch (ex) {
        console.log(ex)
      }
    })

    socket.on('close', _ => {
      socketClosed = true
    })

    socket.on('error', error => {
      console.log(`got error on socket, prob unexpected disconnect (?): ${error.message}`)
    })

    ipcMain.on('event', (_, data) => {
      console.log(data)
      socket.write("mouse,2,3,2")
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

