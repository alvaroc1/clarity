import { ChannelMask } from "./ChannelMask"

export enum MouseButton {
  Left,
  Middle,
  Right,
  ScrollUp,
  ScrollDown,
}

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

export type Rgba = [r: number, g: number, b: number, a: number]

/** Guacamole command */
export namespace Command {
  type LayerCmd<CommandName extends string, X extends any[]> = [CommandName, number, ...X]
  type LayerPathCompleteCmd<CommandName extends string, X extends any[]> = [CommandName, ChannelMask, number, ...X]

  export type Copy = [_: 'copy', srclayer: number, sx: number, sy: number, sw: number, sh: number, cm: ChannelMask, dstlayer: number, dx: number, dy: number]
  export const copy = (srclayer: number, sx: number, sy: number, sw: number, sh: number, cm: ChannelMask, dstlayer: number, dx: number, dy: number): Copy =>
    ['copy', srclayer, sx, sy, sw, sh, cm, dstlayer, dx, dy]

  export type Arc = LayerCmd<'arc', [x: number, y: number, radius: number, start: number, end: number, negative: boolean]>
  export const arc = (layer: number, x: number, y: number, radius: number, start: number, end: number, negative: boolean): Arc =>
    ['arc', layer, x, y, radius, start, end, negative]

  export type Rect = LayerCmd<'rect', [x: number, y: number, width: number, height: number]>
  export const rect = (layer: number, x: number, y: number, width: number, height: number): Rect => ['rect', layer, x, y, width, height]

  export type Size = LayerCmd<'size', [width: number, height: number]>
  export const size = (layer: number, width: number, height: number): Size => ['size', layer, width, height]

  export type Move = LayerCmd<'move', [x: number, y: number]>
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

  export type Cstroke = LayerPathCompleteCmd<'cstroke', [cap: Cap, join: Join, thickness: number, color: Rgba]>
  export const cstroke = (layer: number, mask: ChannelMask, cap: Cap, join: Join, thickness: number, color: Rgba): Cstroke =>
    ['cstroke', mask, layer, cap, join, thickness, color]

  export type Cfill = LayerPathCompleteCmd<'cfill', [color: Rgba]>
  export const cfill = (layer: number, mask: ChannelMask, color: Rgba): Cfill => ['cfill', mask, layer, color]

  export type Sync = ['sync', number]
  export const sync = (t: number): Sync => ['sync', t]

  export const fromInstruction = (params: string[]): Command => {
    const [opcode, ...p] = params
    switch (opcode) {
      case 'copy':
        return copy(
          parseInt(p[0], 10), // srclayer
          parseFloat(p[1]),   // sx
          parseFloat(p[2]),   // sy
          parseFloat(p[3]),   // sw
          parseFloat(p[4]),   // sh 
          parseInt(p[5], 10) as ChannelMask,
          parseInt(p[6], 10), // dstlayer
          parseFloat(p[7]),   // dx
          parseFloat(p[8]),    // dy
        )
      case 'arc':
        return arc(
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
          parseFloat(p[3]),   // radius
          parseFloat(p[4]),   // start
          parseFloat(p[5]),   // end
          parseInt(p[6], 10) == 1, // negative
        )
      case 'rect':
        return rect(
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
          parseFloat(p[3]),   // width
          parseFloat(p[4]),   // height
        )
      case 'size':
        return size(
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // width
          parseFloat(p[2]),   // height
        )
      case 'move':
        return move(
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
        )
      case 'start':
        return start(
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
        )
      case 'close':
        return close(
          parseInt(p[0], 10), // layer
        )
      case 'push':
        return push(
          parseInt(p[0], 10), // layer
        )
      case 'pop':
        return pop(
          parseInt(p[0], 10), // layer
        )
      case 'identity':
        return identity(
          parseInt(p[0], 10), // layer
        )
      case 'transform':
        return transform(
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),
          parseFloat(p[2]),
          parseFloat(p[3]),
          parseFloat(p[4]),
          parseFloat(p[5]),
          parseFloat(p[6]),
        )
      case 'line':
        return line(
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
        )
      case 'cure':
        return curve(
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),
          parseFloat(p[2]),
          parseFloat(p[3]),
          parseFloat(p[4]),
          parseFloat(p[5]),
          parseFloat(p[6]),
        )
      case 'cstroke':
        return cstroke(
          parseInt(p[1], 10), // layer
          parseInt(p[0], 10) as ChannelMask,
          parseInt(p[2], 10) as Cap,
          parseInt(p[3], 10) as Join,
          parseFloat(p[4]),   // thickness
          [
            parseInt(p[5], 10),   // r
            parseInt(p[6], 10),   // g
            parseInt(p[7], 10),   // b
            parseFloat(p[9]),     // a
          ]
        )
      case 'cfill':
        return cfill(
          parseInt(p[1], 10), // layer
          parseInt(p[0], 10) as ChannelMask,
          [
            parseInt(p[2], 10),   // r
            parseInt(p[3], 10),   // g
            parseInt(p[4], 10),   // b
            parseFloat(p[5]),     // a
          ]
        )
      case 'sync':
        return sync(
          parseInt(p[0], 10) // t
        )
      default: throw `Unexpected: ${params}`
    }
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
  export const mouse = (x: number, y: number, buttons: Set<MouseButton>): Mouse => ['mouse', x, y, [...buttons.values()].reduce((a, b) => a + b, 0)]

  export type Sync = ['sync', number]
  export const sync = (t: number): Sync => ['sync', t]

  export type ClientCommand = Click | MouseMove | Mouse | Sync

}