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

  export type Copy = [_:'copy', srclayer:number, sx:number, sy:number, sw:number, sh:number, cm:ChannelMask, dstlayer: number, dx:number, dy:number]
  export const copy = (srclayer:number, sx:number, sy:number, sw:number, sh:number, cm:ChannelMask, dstlayer: number, dx:number, dy:number) => 
    ['copy', srclayer, sx, sy, sw, sh, cm, dstlayer, dx, dy]

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

  export type Push = LayerCmd<'push', []>
  export const push = (layer: number): Push => ['push', layer]

  export type Pop = LayerCmd<'pop', []>
  export const pop = (layer: number): Pop => ['pop', layer]

  export type Identity = LayerCmd<'identity', []>
  export const identity = (layer: number): Identity => ['identity', layer]

  export type Transform = LayerCmd<'transform', [number, number, number, number, number, number]>
  export const transform = (layer: number, a:number, b:number, c:number, d:number, e:number, f:number): Transform => 
    ['transform', layer, a, b, c, d, e, f]

  export type Line = LayerCmd<'line', [x:number, y:number]>
  export const line = (layer: number, x:number, y:number): Line => ['line', layer, x, y]

  export type Curve = LayerCmd<'curve', [cp1x:number, cp1y:number, cp2x:number, cp2y:number, x:number, y:number]>
  export const curve = (layer: number, cp1x:number, cp1y:number, cp2x:number, cp2y:number, x:number, y:number): Curve => ['curve', layer, cp1x, cp1y, cp2x, cp2y, x, y]

  export type Cstroke = LayerPathCompleteCmd<'cstroke', [cap:Cap, join:Join, thickness:number, r:number, g:number, b:number, a:number]>
  export const cstroke = (layer: number, mask: ChannelMask): Cstroke => ['cstroke', mask, layer, Cap.Butt, Join.Bevel, 5, 100, 200, 50, 1]

  export type Cfill = LayerPathCompleteCmd<'cfill', [r:number, g:number, b:number, a:number]>
  export const cfill = (layer: number, mask: ChannelMask, r: number, g: number, b: number, a: number): Cfill => ['cfill', mask, layer, r, g, b, a] 

  export const parse = (cmdStr: string): Command => {
    const [cmd, ...rest] = cmdStr.trim().split(',')
    return [cmd, ...rest.map(v => parseFloat(v))] as any as Command
  }
}

export type CanvasCommand = Command.Copy

export type LayerCommand = Command.Arc | Command.Rect | Command.Start | Command.Line | Command.Size | Command.Move | Command.Close | Command.Identity |
  Command.Transform | Command.Push | Command.Pop | Command.Curve
export type LayerPathCompleteCommand = Command.Cstroke | Command.Cfill
export type Command = CanvasCommand | LayerCommand | LayerPathCompleteCommand
