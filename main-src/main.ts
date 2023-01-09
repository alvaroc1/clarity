import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import path from 'path'
import * as net from 'net'
import { Session } from './Session'
import { ServerInstruction } from '../guacamole/ServerInstruction'
import { Parser } from '../protocol/Parser'
import { Server } from './Server'
import { SettingsWindow } from '../shared/SettingsWindow'
import { Clarity } from './Clarity'
import * as electronSquirrelStartup from 'electron-squirrel-startup';

// windows installer wrapper
if (electronSquirrelStartup) app.quit();

app.on('ready', async () => {
  const quitServer = await Clarity.run()

  app.on('before-quit', async () => {
    await quitServer()
  })
})

/*

let clarityPort = 9005
let newClarityPort = 9005

let runningServer: RunningServer | null = null

app.on('ready', async event => {
  const tray = new Tray(path.join(__dirname, "clarityTemplate@2x.png"))
  tray.setToolTip("Clarity Settings")

  SettingsWindow.initialize(
    newClarityPort => {
      if (newClarityPort != clarityPort) {
        clarityPort = newClarityPort
        runningServer!.close()
        runningServer = Server.run(clarityPort)
      }
    }
  )
  ipcMain.on('port-changed', (_, port) => {
    newClarityPort = port
  })

  runningServer = Server.run(clarityPort)

  const openSettings = () => {
    SettingsWindow.show(clarityPort)
    //settingsWindow.loadFile("build/index.html")
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Running: Port 9005', icon: path.join(__dirname, "on@2x.png") },
    { type: 'separator' },
    { label: 'Settings...', click: openSettings, icon: path.join(__dirname, "settings@2x.png") },
    { label: 'About Clarity', role: 'about', icon: path.join(__dirname, "clarityTemplate@2x.png") },
    { type: 'separator' },
    { label: 'Quit Clarity', role: 'quit' }
  ])

  tray.setContextMenu(contextMenu)


  // TODO: how to do this?
  //Menu.setApplicationMenu(contextMenu)


  const server = net.createServer({ pauseOnConnect: true }, socket => {
    console.log("CONNECTED")

    let socketClosed = false

    const session = Session.create(() => {
      app.dock.show()
      socket.resume()
    })

    const parser = new Parser((cmd) => {
      const parsed = ServerInstruction.fromStringArray(cmd)
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

// prevent app from quiting
app.on('window-all-closed', () => {
  app.dock.hide()
})

app.setAboutPanelOptions({
  applicationName: 'Clarity',
  applicationVersion: 'v0.0.1',
  authors: [
    "Alvaro Carrasco"
  ],
  copyright: '© 2022 Alvaro Carrasco',
  website: 'https://github.com/alvaroc1/clarity'
})

const encodeCommand = (command: string[]): string => {
  return command.map(segment => {
    const seg = segment.toString()
    return seg.length + "." + seg
  }).join(",")
};
*/