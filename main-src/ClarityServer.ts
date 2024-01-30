import { ClientInstruction } from '../guacamole/ClientInstruction'
import { Parser } from '../guacamole/Parser'
import { ServerInstruction } from '../guacamole/ServerInstruction'
import { createSession } from './createSession'
import { SocketServer } from './net/SocketServer'
import logger from 'electron-log/main'

const log = logger.scope('Server')

export type ClarityServer = {
  close: () => Promise<void>
}

type ClarityServerOptions = {
  onAddressInUse: () => void
  onNoAccess: () => void
}

type ClaritySession = {
  close: () => void
}

function sessionHandler (read: AsyncIterable<Buffer>, write: (data: string) => void, close: () => void): ClaritySession {
  const session = createSession({
    onClose: () => close(),
  })
  const parser = new Parser()

  Promise.all([
    // stream instructions to the session
    (async function () {
      try {
        for await (const instruction of parser.parse(read)) {
          await session.send([ServerInstruction.fromStringArray(instruction)])
        }
      } catch (ex) {
        log.error('ERROR RECEIVING!', ex)
      }
    })(),
    // stream session events to the client
    (async function () {
      try {
        for await (const instruction of session.receive()) {
          write(ClientInstruction.encode(instruction))
        }
      } catch (ex) {
        log.error('ERROR SENDING!', ex)
      }
    })()
  ]).then(() => undefined)

  return {
    close () {
      session.close()
    }
  }
}

export const ClarityServer = {
  async start (
    port: number, 
    options: ClarityServerOptions
  ): Promise<ClarityServer> {
    const closeServer = await SocketServer.start(
      port, 
      sessionHandler,
      options
    )
    return {close: closeServer}
  }
}