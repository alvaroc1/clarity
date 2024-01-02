import { ChannelMask } from '../drawing/ChannelMask'
import { Cap } from '../drawing/Cap'
import { Join } from '../drawing/Join'
import { Rgba } from '../drawing/Rgba'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cmd<Opcode extends string, X extends any[]> = [opcode: Opcode, ...X]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LayerCmd<Opcode extends string, X extends any[]> = Cmd<Opcode, [layer: number, ...X]>

type Select = Cmd<'select', [protocol: string]>
type Sync = Cmd<'sync', [number]>
type Copy = Cmd<'copy', [srclayer: number, sx: number, sy: number, sw: number, sh: number, cm: ChannelMask, dstlayer: number, dx: number, dy: number]>
type Arc = LayerCmd<'arc', [x: number, y: number, radius: number, start: number, end: number, negative: boolean]>
type Rect = LayerCmd<'rect', [x: number, y: number, width: number, height: number]>
type Size = LayerCmd<'size', [width: number, height: number]>
type Move = LayerCmd<'move', [x: number, y: number]>
type Start = LayerCmd<'start', [x: number, y: number]>
type Close = LayerCmd<'close', []>
type Push = LayerCmd<'push', []>
type Pop = LayerCmd<'pop', []>
type Identity = LayerCmd<'identity', []>
type Transform = LayerCmd<'transform', [number, number, number, number, number, number]>
type Line = LayerCmd<'line', [x: number, y: number]>
type Curve = LayerCmd<'curve', [cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number]>
type Cstroke = LayerPathCompleteCmd<'cstroke', [cap: Cap, join: Join, thickness: number, color: Rgba]>
type Cfill = LayerPathCompleteCmd<'cfill', [color: Rgba]>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LayerPathCompleteCmd<Opcode extends string, X extends any[]> = Cmd<Opcode, [mask: ChannelMask, layer: number, ...X]>

type CanvasCommand = Copy
type LayerCommand = Arc | Rect | Start | Line | Size | Move | Close | Identity | Transform | Push | Pop | Curve
type LayerPathCompleteCommand = Cstroke | Cfill

export type ControlCommand = Select | Sync
export type RenderCommand = CanvasCommand | LayerCommand | LayerPathCompleteCommand
export type DisplayCmd = Sync | RenderCommand
export type ServerInstruction = ControlCommand | DisplayCmd

/** Guacamole command */
export const ServerInstruction = {
  fromStringArray (params: string[]): ServerInstruction {
    const [opcode, ...p] = params
    switch (opcode) {
      case 'copy':
        return [
          'copy',
          parseInt(p[0], 10), // srclayer
          parseFloat(p[1]),   // sx
          parseFloat(p[2]),   // sy
          parseFloat(p[3]),   // sw
          parseFloat(p[4]),   // sh 
          parseInt(p[5], 10) as ChannelMask,
          parseInt(p[6], 10), // dstlayer
          parseFloat(p[7]),   // dx
          parseFloat(p[8]),    // dy
        ]
      case 'arc':
        return [
          'arc',
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
          parseFloat(p[3]),   // radius
          parseFloat(p[4]),   // start
          parseFloat(p[5]),   // end
          parseInt(p[6], 10) == 1, // negative
        ]
      case 'rect':
        return [
          'rect',
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
          parseFloat(p[3]),   // width
          parseFloat(p[4]),   // height
        ]
      case 'size':
        return [
          'size', 
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // width
          parseFloat(p[2]),   // height
        ]

      case 'move':
        return [
          'move',
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
        ]
      case 'start':
        return [
          'start',
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
        ]
      case 'close':
        return [
          'close',
          parseInt(p[0], 10), // layer
        ]
      case 'push':
        return [
          'push',
          parseInt(p[0], 10), // layer
        ]
      case 'pop':
        return [
          'pop',
          parseInt(p[0], 10), // layer
        ]
      case 'identity':
        return [
          'identity',
          parseInt(p[0], 10), // layer
        ]
      case 'transform':
        return [
          'transform',
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),
          parseFloat(p[2]),
          parseFloat(p[3]),
          parseFloat(p[4]),
          parseFloat(p[5]),
          parseFloat(p[6]),
        ]
      case 'line':
        return [
          'line',
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),   // x
          parseFloat(p[2]),   // y
        ]
      case 'curve':
        return [
          'curve',
          parseInt(p[0], 10), // layer
          parseFloat(p[1]),
          parseFloat(p[2]),
          parseFloat(p[3]),
          parseFloat(p[4]),
          parseFloat(p[5]),
          parseFloat(p[6]),
        ]
      case 'cstroke':
        return [
          'cstroke',
          parseInt(p[0], 10) as ChannelMask,
          parseInt(p[1], 10), // layer
          parseInt(p[2], 10) as Cap,
          parseInt(p[3], 10) as Join,
          parseFloat(p[4]),   // thickness
          [
            parseInt(p[5], 10),   // r
            parseInt(p[6], 10),   // g
            parseInt(p[7], 10),   // b
            parseInt(p[8], 10),   // a
          ]
        ]
      case 'cfill':
        return [
          'cfill',
          parseInt(p[0], 10) as ChannelMask,
          parseInt(p[1], 10), // layer
          [
            parseInt(p[2], 10),   // r
            parseInt(p[3], 10),   // g
            parseInt(p[4], 10),   // b
            parseFloat(p[5]),     // a
          ]
        ]
      case 'sync':
        return [
          'sync',
          parseInt(p[0], 10) // t
        ]
      default:
        console.error(`Unhandled: ${params}`)
        throw `Unexpected: ${params}`
    }
  }
}

