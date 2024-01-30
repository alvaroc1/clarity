import path from 'path'
import Store from 'electron-store'
import { Tray } from 'electron'
import { createSettingsWindow } from '../shared-src/SettingsWindow'
import { Status } from './Status'
import { buildContextMenu } from './buildContextMenu'
import { ClarityServer } from './ClarityServer'

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
    const serverClose = await ClarityServer.start(
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

  let server = await startServer()


  const restart = async () => {
    // restart
    try {
      await server.close()
    } catch(e) {
      console.error(e)
    }
    rebuildTrayMenu()

    server = await startServer()
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
    await server.close()
    rebuildTrayMenu()
    settingsWindow.close()
  }
}
