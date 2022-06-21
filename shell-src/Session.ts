import { BrowserWindow, ipcMain } from 'electron'
import { Command } from '../protocol/Command'

/** Represents a single connection and a single window being controlled by a server 
 * for now, a session is just something that can receive commands
 */
export class Session {

  // keep track of any commands before we loaded the window
  #commandsBeforeLoaded: Command[] = []
  #commandsBeforeLoadedFlushed = false
  #indexLoaded = false
  #win = new BrowserWindow({
    title: "Clarity",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // keeping simple for now
    // clarity is just a drawing canvas for now,
    // not a full blown ui platform
    //resizable: false
    resizable: true,
  })

  constructor() {
    this.#win.loadFile("build/index.html").then(_ => {
      this.#indexLoaded = true
    })
  }

  send(commands: Command[]) {
    if (!this.#indexLoaded) {
      commands.forEach(command => this.#commandsBeforeLoaded.push(command))
    } else {
      if (!this.#commandsBeforeLoadedFlushed) {
        this.#win.webContents.send('commands', this.#commandsBeforeLoaded)
        this.#commandsBeforeLoaded = []
        this.#commandsBeforeLoadedFlushed = true
      }
      this.#win.webContents.send('commands', commands)
    }
  }
}

export namespace Session {
  export const create = (): Session => new Session()
}
