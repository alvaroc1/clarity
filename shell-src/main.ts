import { app, BrowserWindow, ipcMain } from 'electron'
import * as net from 'net'
import { AsyncQueue2 } from './util/AsyncQueue'
import { Session } from './Session'
import { Command } from '../protocol/Command'

let session: Session | null = null

let commandsQueue2: Command[] = []

app.on('ready', async event => {
  const commandQueue = new AsyncQueue2<Command>()

  const server = net.createServer(socket => {
    console.log("CONNECTED")

    let socketClosed = false

    if (session == null) {
      session = Session.create(commandQueue)
    }

    socket.on('data', data => {
      //console.log(`DATA: ${data.length}`)
      // process command
      const commands = data.toString()
        .split(";")
        // drop the size of each command at the beginning
        .map((s: string) => s.trim())
        .filter((cmd: string) => cmd !== "")
        .map(cmd => Command.parse(cmd))

      commands.forEach(command => {
        //if (command[0] == "sync") {
        //  commandQueue.offerBatch(commandsQueue2)
        //  commandsQueue2 = []
        //} else {
          commandQueue.offerBatch([command])
        //}
      })

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

    ipcMain.on('event', ev => {
      console.log(ev)
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

  /*
  await win.webContents.session.loadExtension(
    path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.10.1_0')
  )
  */

  //await win.loadFile("build/index.html")
  //win.webContents.openDevTools()
  
})
