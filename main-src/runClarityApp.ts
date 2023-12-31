import Store from 'electron-store'
import { Tray } from 'electron'
import path from 'path'
import { runServer } from './net/runServer'
import { createSettingsWindow } from '../shared-src/SettingsWindow'
import { Parser } from '../guacamole/Parser'
import { createSession } from './createSession'
import { ServerInstruction } from '../guacamole/ServerInstruction'
import { ClientInstruction } from '../guacamole/ClientInstruction'
import { Status } from './Status'
import { buildContextMenu } from './buildContextMenu'

const store = new Store<{ port: number, error: string | null }>()

/**
 * Runs the single instance of the clarity app
 * 
 * @returns A function that will close the app
 */
export async function runClarityApp(): Promise<() => Promise<void>> {

  let status = Status.stopped

  function getPort () {
    return store.get('port', 9002)
  }

  const settingsWindow = await createSettingsWindow(
    {
      port: getPort(),
      error: null
    },
    (newPort) => {
      store.set('port', newPort)
      if (status === Status.stopped) restart()
    }
  )

  const tray = new Tray(path.join(__dirname, 'clarityTemplate@2x.png'))

  const rebuildTrayMenu = () => {
    tray.setContextMenu(buildContextMenu(status, getPort(), () => settingsWindow.show()))
  }

  const startServer = async () => {
    status = Status.starting
    const port = getPort()
    const serverClose = await startServerOnPort(
      port,
      {
        onAddressInUse() {
          status = Status.stopped
          settingsWindow.update({
            error: `Port ${port} already in use`
          })
          settingsWindow.show()
        },
        onNoAccess() {
          status = Status.stopped
          settingsWindow.update({
            error: 'No access'
          })
          settingsWindow.show()
        },
      }
    )
    status = Status.running
    settingsWindow.update({
      error: null
    })
    rebuildTrayMenu()
    return serverClose
  }

  let closeServer = await startServer()


  const restart = async () => {
    // restart
    try {
      await closeServer()
    } catch(e) {
      console.error(e)
    }
    rebuildTrayMenu()

    closeServer = await startServer()
  }

  const handlePortChange = async (newPort: number) => {
    status = Status.stopping
    rebuildTrayMenu()
    settingsWindow.update({
      port: newPort,
      error: null
    })
    restart()
  }

  store.onDidChange('port', async (newPort) => {
    if (newPort === undefined) {
      throw 'Undefined newPort!'
    }
    await handlePortChange(newPort)
  })

  rebuildTrayMenu()

  // returns a function to stop the server
  return async () => {
    rebuildTrayMenu()
    await closeServer()
    rebuildTrayMenu()
    settingsWindow.close()
  }
}

async function startServerOnPort (
  port: number, 
  {onAddressInUse, onNoAccess}: {onAddressInUse: () => void, onNoAccess: () => void}
): Promise<() => Promise<void>> {
  const closeServer = await runServer(
    port, 
    async (read, write, close): Promise<void> => {
      const session = createSession({
        onClose: () => {
          close()
        },
      })

      await Promise.all([
        // stream instructions to the session
        (async function () {
          for await (const instruction of Parser.parse(read)) {
            await session.send([ServerInstruction.fromStringArray(instruction)])
          }
        })(),
        // stream session events to the client
        (async function () {
          for await (const instruction of session.receive()) {
            write(ClientInstruction.encode(instruction))
          }
        })()
      ])
    },
    {
      onAddressInUse,
      onNoAccess
    }
  )
  return closeServer
}
