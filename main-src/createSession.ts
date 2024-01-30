import { BrowserWindow, ipcMain } from 'electron'
import { ClientInstruction } from '../guacamole/ClientInstruction'
import { DisplayCmd, ServerInstruction } from '../guacamole/ServerInstruction'
import { MVar } from '../util/MVar'
import path from 'path'
import logger from 'electron-log/main'
import { boundedQueue } from '../util/boundedQueue'

const log = logger.scope('createSession')

/** Represents a single connection and a single window being controlled by a server 
 * for now, a session is just something that can receive commands
 */
type Session = {
  send (commands: ServerInstruction[]): Promise<void>
  receive (): AsyncIterable<ClientInstruction>
  close (): void
}

export function createSession ({
  onClose
} : {
  onClose: () => void
}): Session {
  // const incomingChannel = MVar.empty<ServerInstruction[]>()
  // TODO: this actually prevents more than max size commands from being on a single frame
  // since the server will block until the window has processed the commands
  const incomingChannel = boundedQueue<ServerInstruction[]>(10000)
  const outgoingChannel = MVar.empty<ClientInstruction>()

  let win: BrowserWindow | undefined

  return {
    receive: async function* (): AsyncIterable<ClientInstruction> {
      while (true) {
        yield await outgoingChannel.take()
      }
    },
    async send (commands: ServerInstruction[]) {
      // if we don't have window yet, extract the size from the first command and create one
      if (!win) {
        log.info('NO WINDOW, creating')
        const first = commands[0]
        const [command, layer, width, height] = first
        if (command !== 'size' || layer !== 0) {
          log.error('Error: first command must be a size command on layer zero, got', command, layer)
          throw `Error: first command must be a size command, got: ${command} on ${layer}`
        }

        win = createBrowserWindow<ClientInstruction>({
          width, 
          height,
          async onContentLoaded (win) {
            for await (const commands of incomingChannel.dequeue()) {
              if (win.isDestroyed()) {
                log.warn('Window destroyed')
                break
              }
              win.webContents.send('commands', commands)
            }
          },
          async onSend (data) {
            return await outgoingChannel.put(data)
          },
          onClose: () => {
            win = undefined
            onClose()
          }
        })
      }

      if (commands[0][0] === 'sync') {
        // log.info('commands', 'sync')
      }

      const displayCommands: DisplayCmd[] = []
      for (const command of commands) {
        // if resizing layer 0, we have to resize the window
        if (command[0] === 'size' && command[1] === 0) {
          win.setContentSize(command[2], command[3], false)
        }

        switch (command[0]) {
          case 'select': break
          default: displayCommands.push(command)
        }
      }
      await incomingChannel.enqueue(displayCommands)
    },
    close () {
      log.warn('Closing session')
      win?.close()
    }
  }
}

function createBrowserWindow <SendData>({
  width, 
  height, 
  onContentLoaded,
  onSend,
  onClose,
}: {
  width: number, 
  height: number, 
  onContentLoaded: (win: BrowserWindow) => void,
  onSend: (data: SendData) => Promise<void>,
  onClose: () => void,
}) {
  log.info('createBrowserWindow')
  const win = new BrowserWindow({
    title: 'Clarity',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
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

  ipcMain.on('event', (_, data) => {
    onSend(data)
  })
  win.loadFile('build/index.html')// .then(() => onContentLoaded(win))
  win.once('ready-to-show', () => {
    log.info('window show')
    win.show()
    onContentLoaded(win)
  })
  win.on('close', () => {
    log.info('window close')
    onClose()
  })

  return win
}
