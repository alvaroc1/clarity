import { app, BrowserWindow, ipcMain } from 'electron'
//import * as path from 'path'
//import * as os from 'os'
import * as net from 'net'
import { AsyncQueue } from './util/AsyncQueue'
import { Session } from './Session'

const parseControlCommand = (cmd: string): string | null => {
  return (cmd.substr(0, 6) == 'select') ? 'select' : null
}

let session: Session | null = null

app.on('ready', async event => {
  const commandQueue = new AsyncQueue<string>()

  const server = net.createServer(socket => {
    socket.on('data', data => {
      console.log(`main.ts: Data Received: ${data}`)

      // process command
      data.toString()
        .split("\n")
        .map((s: string) => s.trim())
        .filter((cmd: string) => cmd !== "")
        .forEach((cmd: string) => {
          if (parseControlCommand(cmd) == 'select') {
            if (session == null) {
              session = Session.create(commandQueue)
            }
          } else {
            commandQueue.offer(cmd)
          }
        })
    })
  
    socket.on('connect', (_: net.Socket) => {
      console.log('client connect')
    })
  })
  server.listen(9002)
  server.on('connection', (_: net.Socket) => {
    console.log('connection')

    //openWindow().catch(e => console.error(e))
  })
  server.on('listening', (_: net.Socket) => console.log('listening'))
  server.on('error', (_: net.Socket) => console.log('error'))
  server.on('close', (_: net.Socket) => console.log('error'))



  /*
  await win.webContents.session.loadExtension(
    path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.10.1_0')
  )
  */

  //await win.loadFile("build/index.html")
  //win.webContents.openDevTools()
  
})
