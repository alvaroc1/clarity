import { BrowserWindow, ipcMain } from 'electron'
import { ClientInstruction } from '../guacamole/ClientInstruction'
import { ServerInstruction } from '../guacamole/ServerInstruction'

type SessionImplementation = {
  onClose: () => void,
  send: (c: ClientInstruction) => void,
}

/** Represents a single connection and a single window being controlled by a server 
 * for now, a session is just something that can receive commands
 */
export class Session {

  #debug = true

  #win: BrowserWindow | undefined
  #onClose: () => void
  #send: (c: ClientInstruction) => void
  #queuedCommands: ServerInstruction[] = []
  #domLoaded = false;

  constructor({onClose, send} : SessionImplementation) {
    this.#onClose = onClose
    this.#send = send
  }

  #sendCommands (commands: ServerInstruction[]) {
    if (this.#win && this.#win.isDestroyed()) return;

    if (this.#domLoaded) {
      this.#win!.webContents.send('commands', commands)
    } else {
      this.#queuedCommands.push(...commands);
    }
  }

  send(commands: ServerInstruction[]) {
    // if we don't have window yet, extract the size from the first command and create one
    if (!this.#win) {
      const [first, ..._rest] = commands;
      const [command, layer, width, height] = first
      if (command !== 'size' || layer !== 0) {
        console.error('Error: first command must be a size command')
        throw 'Error: first command must be a size command'
      }

      this.#win = this.#createBrowserWindow({
        width, 
        height,
        onContentLoaded: () => {
          this.#win!.webContents.send('commands', this.#queuedCommands)
          this.#domLoaded = true
        },
      })
    }

    this.#sendCommands(commands)
  }

  #createBrowserWindow ({width, height, onContentLoaded}: {width: number, height: number, onContentLoaded: () => void}) {
    const win = new BrowserWindow({
      title: "Clarity",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      // keeping simple for now
      // clarity is just a drawing canvas for now,
      // not a full blown ui platform
      //resizable: false
      resizable: this.#debug,
      useContentSize: true,
      width,
      height,
      //frame: !this.#debug,
      roundedCorners: false,
      show: false,
    })


    ipcMain.on('resize', (event: any, width: number, height: number) => {
      if (!win.isDestroyed()) {
        win.setContentSize(width, height, false)
      }
    })
    ipcMain.on('event', (_, data) => {
      this.#send(data)
    })
    win.loadFile("build/index.html").then(_ => onContentLoaded())
    win.once('ready-to-show', () => {
      win.show()
    })
    win.on('close', () => this.#onClose())

    return win
  }
}

export namespace Session {
  export const create = (impl: SessionImplementation): Session => new Session(impl)
}
