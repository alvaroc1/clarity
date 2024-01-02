import type { ClientInstruction } from '../guacamole/ClientInstruction'
import type { DisplayCmd } from '../guacamole/ServerInstruction'

declare namespace clarity {
  function send (command: ClientInstruction): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onCommands (fn: (event: any, commands: DisplayCmd[]) => void): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function emitEvent (windowId: string, ev: any): void
  function closeWindow (windowId: string): void
  function onUpdate <P>(fn: (props: P) => void): void
}
