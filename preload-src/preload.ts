import { contextBridge } from 'electron'

import Renderer from 'electron/renderer'
import type { ClientInstruction } from '../guacamole/ClientInstruction'
import type { DisplayCmd } from '../guacamole/ServerInstruction'
import { clarity } from '../shared-src/clarity'

const ipcRenderer = Renderer.ipcRenderer

contextBridge.exposeInMainWorld('clarity', {

  send (command: ClientInstruction): void {
    ipcRenderer.send(
      'event',
      command
    )
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCommands (fn: (ev: any, commands: DisplayCmd[]) => void) {
    ipcRenderer.on('commands', fn)
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitEvent (windowId: string, ev: any) {
    ipcRenderer.send(`window.${windowId}`, ev)
  },

  closeWindow (windowId: string) {
    ipcRenderer.send(`window.${windowId}.close`, undefined)
  },

  onUpdate <P>(fn: (props: P) => void) {
    ipcRenderer.on('update', (_, props: P) => fn(props))
  },
} satisfies typeof clarity)
