import { MouseButton } from '../drawing/MouseButton'

type Args = [opcode: 'args', protocolVersion: string, ...other: string[]]

/* custom commands, TODO: use standard 'mouse' */
type Click = [opcode: 'click', x: number, y: number]
type MouseMove = [opcode: 'mousemove', x: number, y: number]
/* ---------- */

type Mouse = [opcode: 'mouse', x: number, y: number, mask: number]

type Sync = [opcode: 'sync', number]

export const ClientInstruction = {
  // export const args = (protocolVersion: string, ...other: string[]): Args => ['args', protocolVersion, ...other]
  // click: (x: number, y: number): Click => ['click', x, y],
  // mousemove: (x: number, y: number): Mouse => ['mouse', x, y, 0],

  mouse: (x: number, y: number, buttons: Set<MouseButton>): Mouse => 
    ['mouse', x, y, [...buttons.values()].reduce((a, b) => a + b, 0)],
  sync: (t: number): Sync => ['sync', t],

  encode: (command: ClientInstruction): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return command.map((v: any) => {
      const s = v.toString()
      return `${s.length}.${s}`
    }).join(',') + ';'
  }
}

export type ClientInstruction = Args | Click | MouseMove | Mouse | Sync