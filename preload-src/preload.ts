import { contextBridge } from 'electron'

import Renderer from 'electron/renderer'
import type { ClientInstruction } from '../guacamole/ClientInstruction'
import type { ServerInstruction } from '../guacamole/ServerInstruction'
import { clarity } from '../shared-src/clarity'

const ipcRenderer = Renderer.ipcRenderer

contextBridge.exposeInMainWorld('clarity', {

  send (command: ClientInstruction): void {
    ipcRenderer.send(
      'event',
      command
    )
  },

  onCommands (fn: (ev: any, commands: ServerInstruction[]) => void) {
    ipcRenderer.on('commands', fn)
  },

  resize (width: number, height: number) {
    ipcRenderer.send('resize', width, height)
  },

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
