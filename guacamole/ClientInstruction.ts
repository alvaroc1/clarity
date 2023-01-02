import { MouseButton } from "../drawing/MouseButton"

export namespace ClientInstruction {
  export type Args = [_: 'args', protocolVersion: string, ...other: string[]]
  export const args = (protocolVersion: string, ...other: string[]): Args => ['args', protocolVersion, ...other]

  /* CUSTOM COMMANDS FOR NOW */
  export type Click = ['click', number, number]
  export const click = (x: number, y: number): Click => ['click', x, y]

  export type MouseMove = ['mousemove', number, number]
  export const mousemove = (x: number, y: number): MouseMove => ['mousemove', x, y]
  /* */

  export type Mouse = ['mouse', number, number, number]
  export const mouse = (x: number, y: number, buttons: Set<MouseButton>): Mouse => ['mouse', x, y, [...buttons.values()].reduce((a, b) => a + b, 0)]

  export type Sync = ['sync', number]
  export const sync = (t: number): Sync => ['sync', t]

  export const encode = (command: ClientInstruction): string => {
    return command.map(v => {
      const s = v.toString()
      return `${s.length}.${s}`
    }).join(',') + ';'
  }

}

export type ClientInstruction =
  ClientInstruction.Args |
  ClientInstruction.Click |
  ClientInstruction.MouseMove |
  ClientInstruction.Mouse |
  ClientInstruction.Sync