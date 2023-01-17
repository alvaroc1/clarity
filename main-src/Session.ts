import { BrowserWindow, ipcMain } from 'electron'
import { ClientInstruction } from '../guacamole/ClientInstruction'
import { ServerInstruction } from '../guacamole/ServerInstruction'
import { MVar } from '../util/MVar'

/** Represents a single connection and a single window being controlled by a server 
 * for now, a session is just something that can receive commands
 */
type Session = {
  send (commands: ServerInstruction[]): void
}
export namespace Session {
  export function create ({
    onClose, 
    send
  } : {
    onClose: () => void, 
    send: (c: ClientInstruction) => void
  }): Session {
    const commandsChannel = MVar.empty<ServerInstruction[]>()

    let win: BrowserWindow | undefined

    return {
      send (commands: ServerInstruction[]) {
        // if we don't have window yet, extract the size from the first command and create one
        if (!win) {
          const first = commands[0];
          const [command, layer, width, height] = first
          if (command !== 'size' || layer !== 0) {
            console.error('Error: first command must be a size command')
            throw 'Error: first command must be a size command'
          }

          win = createBrowserWindow({
            width, 
            height,
            async onContentLoaded (win) {
              while (!win.isDestroyed()) {
                const commands = await commandsChannel.take()
                win.webContents.send('commands', commands)
              }
            },
            onSend: send,
            onClose
          })
        }

        void commandsChannel.put(commands)
      }
    }
  }
}

function createBrowserWindow ({
  width, 
  height, 
  onContentLoaded,
  onSend,
  onClose,
}: {
  width: number, 
  height: number, 
  onContentLoaded: (win: BrowserWindow) => void,
  onSend: (data: any) => void,
  onClose: () => void,
}) {
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
    resizable: true,
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
    onSend(data)
  })
  win.loadFile("build/index.html").then(_ => onContentLoaded(win))
  win.once('ready-to-show', () => {
    win.show()
  })
  win.on('close', () => onClose())

  return win
}
