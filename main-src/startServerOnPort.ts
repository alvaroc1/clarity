import { ClientInstruction } from '../guacamole/ClientInstruction'
import { ServerInstruction } from '../guacamole/ServerInstruction'
import { Parser } from '../guacamole/Parser'
import { createSession } from './createSession'
import { runServer } from './net/runServer'

export async function startServerOnPort (
  port: number, 
  {onAddressInUse, onNoAccess}: {onAddressInUse: () => void, onNoAccess: () => void}
): Promise<() => Promise<void>> {
  const closeServer = await runServer(
    port, 
    async (read, write, close): Promise<void> => {
      const session = createSession({
        onClose: () => close(),
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
