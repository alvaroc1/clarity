import type { ClientInstruction } from '../guacamole/ClientInstruction'
import type { ServerInstruction } from '../guacamole/ServerInstruction'

declare namespace clarity {
  function resize (width: number, height: number): void
  function send (command: ClientInstruction): void
  function onCommands (fn: (event: any, commands: ServerInstruction[]) => void): void
  function emitEvent (windowId: string, ev: any): void
  function closeWindow (windowId: string): void
  function onUpdate <P>(fn: (props: P) => void): void
}
