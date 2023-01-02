import Store from 'electron-store'
import { Menu, Tray } from 'electron'
import path from 'path'
import { Server } from './Server'
import { SettingsWindow } from '../shared/SettingsWindow'
import { Parser } from '../protocol/Parser'
import { Session } from './Session'
import { ServerInstruction } from '../guacamole/ServerInstruction'
import { ClientInstruction } from '../guacamole/ClientInstruction'

enum Status {
  starting,
  running,
  stopping,
  stopped,
}

export class Clarity {
  static #status = Status.stopped

  static async run(): Promise<() => Promise<void>> {
    const server = Server.create(({start, write, dispose}) => {
      // create a session and start listening on the socket when the session loads
      // dispose the socket when the session is closed (browser window close button)
      const session = Session.create({
        onClose: () => dispose(),
        send: (c) => write(ClientInstruction.encode(c))
      })

      // create a parser that will forward commands to the session
      const parser = new Parser(cmd => {
        const parsedCommand = ServerInstruction.fromStringArray(cmd)
        session.send([parsedCommand])
      })

      // start receiving from the socket
      start()

      // return the data handler
      return buf => parser.parse(buf)
    })

    const startOrRestart = async () => {
      const port = store.get('port')
      // restart
      if (server.status == Status.running) {
        await server.close().catch(e => console.error(e))
        rebuildTrayMenu()
      }

      this.#status = Status.starting
      rebuildTrayMenu()

      await server.listen(port)
        .then(() => {
          this.#status = Status.running
          settingsWindow.update({
            error: null
          })
          rebuildTrayMenu()
        })
        .catch((error) => {
          const msg = (() => {
            switch (error.code) {
              case 'EADDRINUSE':
                return `Port ${port} already in use`
              case 'EACCES':
                return `Permission denied for port ${port}`
              default:
                console.log(`Error: ${error}`)
                throw error
            }
          })()

          this.#status = Status.stopped
          rebuildTrayMenu()
          settingsWindow.update({
            error: msg
          })
          settingsWindow.show()
        })
    }

    const handlePortChange = async (newPort: number) => {
      this.#status = Status.stopping
      rebuildTrayMenu()
      settingsWindow.update({
        port: newPort,
        error: null
      })
      startOrRestart()
    }

    const rebuildTrayMenu = () => {
      tray.setContextMenu(this.buildContextMenu(store.get('port'), () => settingsWindow.show()))
    }

    const store = new Store<{ port: number, error: string | null }>()
    store.onDidChange('port', async (newPort) => {
      await handlePortChange(newPort!)
    })
    const port: number = store.get('port', 9002)
    const error: string | null = store.get('error', null)

    const settingsWindow = await SettingsWindow.create(
      {
        port: port,
        error: error
      },
      (newPort) => {
        store.set('port', newPort)
        if (this.#status === Status.stopped) startOrRestart()
      }
    )

    const tray = new Tray(path.join(__dirname, "clarityTemplate@2x.png"))
    rebuildTrayMenu()

    startOrRestart()

    // returns a function to stop the server
    return async () => {
      if (server.status === Status.running) {
        rebuildTrayMenu()
        await server.close()
        rebuildTrayMenu()
      }
      settingsWindow.close()
    }
  }

  static buildContextMenu(port: number, onSettingsClick: () => void) {
    const [onoff, label] = (() => {
      switch (Clarity.#status) {
        case Status.starting: return [false, `Starting: Port ${port}`]
        case Status.running: return [true, `Running: Port ${port}`]
        case Status.stopping: return [true, `Stopping`]
        case Status.stopped: return [false, `Stopped`]
      }
    })()
    return Menu.buildFromTemplate([
      { label: label, icon: path.join(__dirname, onoff ? "on@2x.png" : "off@2x.png") },
      { type: 'separator' },
      { label: 'Settings...', click: onSettingsClick, icon: path.join(__dirname, "settingsTemplate@2x.png") },
      { label: 'About Clarity', role: 'about', icon: path.join(__dirname, "clarityTemplate@2x.png") },
      { type: 'separator' },
      { label: 'Quit Clarity', role: 'quit' }
    ])
  }

}
