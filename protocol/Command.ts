import { assert } from "console"
import { ChannelMask } from "./ChannelMask"

export enum MouseButton {
  Left,
  Middle,
  Right,
  ScrollUp,
  ScrollDown,
}

/** Each parameter includes it's size for efficient parsing, but we don't need that yet */
const stripParamSize = (param: string) => param.replace(/^[0-9]+\./, '')

export namespace Cap {
  export const Butt = 0
  export const Round = 1
  export const Square = 2
}
export type Cap = typeof Cap.Butt | typeof Cap.Round | typeof Cap.Square

export namespace Join {
  export const Bevel = 0
  export const Miter = 1
  export const Round = 2
}
export type Join = typeof Join.Bevel | typeof Join.Miter | typeof Join.Round

/** Guacamole command */
export namespace Command {
  type LayerCmd<CommandName extends string, X extends any[]> = [CommandName, number, ...X]
  type LayerPathCompleteCmd<CommandName extends string, X extends any[]> = [CommandName, ChannelMask, number, ...X]

  export type Copy = [_: 'copy', srclayer: number, sx: number, sy: number, sw: number, sh: number, cm: ChannelMask, dstlayer: number, dx: number, dy: number]
  export const copy = (srclayer: number, sx: number, sy: number, sw: number, sh: number, cm: ChannelMask, dstlayer: number, dx: number, dy: number) =>
    ['copy', srclayer, sx, sy, sw, sh, cm, dstlayer, dx, dy]

  export type Arc = LayerCmd<'arc', [x: number, y: number, radius: number, start: number, end: number, negative: number]>
  export const arc = (layer: number, x: number, y: number, radius: number, start: number, end: number, negative: number): Arc =>
    ['arc', layer, x, y, radius, start, end, negative]

  export type Rect = LayerCmd<'rect', [x: number, y: number, width: number, height: number]>
  export const rect = (layer: number, x: number, y: number, width: number, height: number): Rect => ['rect', layer, x, y, width, height]

  export type Size = LayerCmd<'size', [width: number, height: number]>
  export const size = (layer: number, width: number, height: number): Size => ['size', layer, width, height]

  export type Move = LayerCmd<'move', [x: number, height: number]>
  export const move = (layer: number, x: number, y: number): Move => ['move', layer, x, y]

  export type Start = LayerCmd<'start', [x: number, y: number]>
  export const start = (layer: number, x: number, y: number): Start => ['start', layer, x, y]

  export type Close = LayerCmd<'close', []>
  export const close = (layer: number): Close => ['close', layer]

  export type Push = LayerCmd<'push', []>
  export const push = (layer: number): Push => ['push', layer]

  export type Pop = LayerCmd<'pop', []>
  export const pop = (layer: number): Pop => ['pop', layer]

  export type Identity = LayerCmd<'identity', []>
  export const identity = (layer: number): Identity => ['identity', layer]

  export type Transform = LayerCmd<'transform', [number, number, number, number, number, number]>
  export const transform = (layer: number, a: number, b: number, c: number, d: number, e: number, f: number): Transform =>
    ['transform', layer, a, b, c, d, e, f]

  export type Line = LayerCmd<'line', [x: number, y: number]>
  export const line = (layer: number, x: number, y: number): Line => ['line', layer, x, y]

  export type Curve = LayerCmd<'curve', [cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number]>
  export const curve = (layer: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Curve => ['curve', layer, cp1x, cp1y, cp2x, cp2y, x, y]

  export type Cstroke = LayerPathCompleteCmd<'cstroke', [cap: Cap, join: Join, thickness: number, r: number, g: number, b: number, a: number]>
  export const cstroke = (layer: number, mask: ChannelMask): Cstroke => ['cstroke', mask, layer, Cap.Butt, Join.Bevel, 5, 100, 200, 50, 1]

  export type Cfill = LayerPathCompleteCmd<'cfill', [r: number, g: number, b: number, a: number]>
  export const cfill = (layer: number, mask: ChannelMask, r: number, g: number, b: number, a: number): Cfill => ['cfill', mask, layer, r, g, b, a]

  export const parse = (cmdStr: string): Command => {
    const [cmd, ...rest] = cmdStr.trim().split(',').map(stripParamSize)
    return [cmd, ...rest.map(v => parseFloat(v))] as any as Command
  }

  const dot = '.'.charCodeAt(0)
  const comma = ','.charCodeAt(0)
  const semi = ';'.charCodeAt(0)

  export const parseFromBuffer = (data: Buffer): Command[] => {
    let offset = 0
    let next = data.readUInt8(offset++);

    const parseSize = (): number => {
      let commandSizeChars: number[] = []
      while (next != dot) {
        commandSizeChars.push(next)
        next = data.readUInt8(offset++)
      }
      return parseInt(String.fromCharCode(...commandSizeChars), 10)
    }

    const parseSizedString = (): string => {
      const size = parseSize()
      const s = data.toString(undefined, offset, offset + size)
      offset += size
      next = data.readUInt8(offset++)
      return s
    }

    const parseCommand = (): Command => {
      const command = parseSizedString()

      let params: number[] = []

      // if there are parameters
      if (next == comma) {
        // skip the comma
        next = data.readUInt8(offset++)

        while (next != semi) {
          // consume param
          const param = parseFloat(parseSizedString())

          params.push(param)

          // if we haven't reached the end of the command
          // keep consuming
          if (next != semi) {
            // skip comma
            next = data.readUInt8(offset++)
          }
        }
      }
      return [command, ...params] as any
    }



    let commands: Command[] = []
    while (true) {
      const command = parseCommand()

      commands.push(command)

      if (offset >= data.length) break

      // skip semi
      next = data.readUInt8(offset++)
    }
    return commands
  }
}

export type CanvasCommand = Command.Copy

export type LayerCommand = Command.Arc | Command.Rect | Command.Start | Command.Line | Command.Size | Command.Move | Command.Close | Command.Identity |
  Command.Transform | Command.Push | Command.Pop | Command.Curve
export type LayerPathCompleteCommand = Command.Cstroke | Command.Cfill
export type Command = CanvasCommand | LayerCommand | LayerPathCompleteCommand | ['sync', number]


export namespace ClientCommand {

  /* CUSTOM COMMANDS FOR NOW */
  export type Click = ['click', number, number]
  export const click = (x: number, y: number): Click => ['click', x, y]

  export type MouseMove = ['mousemove', number, number]
  export const mousemove = (x: number, y: number): MouseMove => ['mousemove', x, y]
  /* */

  export type Mouse = ['mouse', number, number, number]
  export const mouse = (x: number, y: number, buttons: Set<MouseButton>) => ['mouse', x, y, [...buttons.values()].reduce((a, b) => a + b, 0)]

  export type ClientCommand = Click | MouseMove | Mouse

}