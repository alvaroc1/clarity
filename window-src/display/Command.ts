import { ChannelMask } from "./ChannelMask"

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

export namespace Command {
  type LayerCmd<CommandName extends string, X extends any[]> = [CommandName, number, ...X]
  type LayerPathCompleteCmd<CommandName extends string, X extends any[]> = [CommandName, ChannelMask, number, ...X]

  export type Arc = LayerCmd<'arc', [x:number, y:number, radius:number, start:number, end:number, negative:number]>
  export const arc = (layer: number, x: number, y: number, radius: number, start: number, end: number, negative: number): Arc =>
    ['arc', layer, x, y, radius, start, end, negative]

  export type Rect = LayerCmd<'rect', [x:number, y:number, width:number, height:number]>
  export const rect = (layer: number, x: number, y: number, width: number, height: number): Rect => ['rect', layer, x, y, width, height]

  export type Size = LayerCmd<'size', [width:number, height:number]>
  export const size = (layer: number, width: number, height: number): Size => ['size', layer, width, height]

  export type Move = LayerCmd<'move', [x:number, height:number]>
  export const move = (layer: number, x: number, y: number): Move => ['move', layer, x, y]

  export type Start = LayerCmd<'start', [x:number, y:number]>
  export const start = (layer: number, x:number, y:number): Start => ['start', layer, x, y]

  export type Close = LayerCmd<'close', []>
  export const close = (layer: number): Close => ['close', layer]

  export type Line = LayerCmd<'line', [x:number, y:number]>
  export const line = (layer: number, x:number, y:number): Line => ['line', layer, x, y]

  export type Cstroke = LayerPathCompleteCmd<'cstroke', [cap:Cap, join:Join, thickness:number, r:number, g:number, b:number, a:number]>
  export const cstroke = (layer: number, mask: ChannelMask): Cstroke => ['cstroke', mask, layer, Cap.Butt, Join.Bevel, 5, 100, 200, 50, 1]

  export type Cfill = LayerPathCompleteCmd<'cfill', [r:number, g:number, b:number, a:number]>
  export const cfill = (layer: number, mask: ChannelMask, r: number, g: number, b: number, a: number): Cfill => ['cfill', mask, layer, r, g, b, a] 

  export const parse = (cmdStr: string): Command => {
    const [cmd, ...rest] = cmdStr.trim().split(',')
    return [cmd, ...rest.map(v => parseFloat(v))] as any as Command
  }
}

export type LayerCommand = Command.Arc | Command.Rect | Command.Start | Command.Line | Command.Size | Command.Move | Command.Close
export type LayerPathCompleteCommand = Command.Cstroke | Command.Cfill
export type Command = LayerCommand | LayerPathCompleteCommand
