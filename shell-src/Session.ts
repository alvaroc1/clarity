import { AsyncQueue2 } from './util/AsyncQueue'
import { app, BrowserWindow, ipcMain } from 'electron'
import { Command } from '../protocol/Command'

/** Represents a single connection and a single window being controlled by a server */
export class Session {

}

export namespace Session {
  export const create = (commandQueue: AsyncQueue2<Command>): Session => {
    const win = new BrowserWindow({
      title: "Clarity",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      // keeping simple for now
      // clarity is just a drawing canvas for now,
      // not a full blown ui platform
      resizable: false
    })
    win.loadFile("build/index.html").then(_ => {
      const poller = async () => {
        const cmds = await commandQueue.poll()
        win.webContents.send('commands', cmds)
        poller()
      }
      poller()
      //setTimeout(x => poller(), 5000);
    })

    /** 
     * Handles resize coming from the server
     */
    ipcMain.on('resize', (event: any, width: number, height: number) => {
      win.setContentSize(width, height, false)
    })

    /*
    ipcMain.on('event', (event: any, data: any) => {
      console.log('EVENT on main')
      onEvent(data as {x: number, y: number})
    })
    */

    return new Session()
  }
}
